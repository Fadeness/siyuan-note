// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ApiService } from './services/siyuanService.js';
import matter from 'gray-matter';
import { HttpClient } from './utils/httpClient.js';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  const httpClient = new HttpClient();
  const apiService = new ApiService(httpClient);
  let serverConnected = false;
  let notebookMaps = new Map();

  let notebooks: any;
  try {
    notebooks = await apiService.getNotebookList();
    serverConnected = true;
  } catch (err) {
    console.log(err);
  }
  if (serverConnected) {
    if (notebooks && notebooks?.length > 0) {
      for (const notebook of notebooks) {
        notebookMaps.set(notebook.name, notebook.id);
        notebookMaps.set(notebook.id, notebook.name);
      }
    }
  }

  // Notebook completion
  let provider = vscode.languages.registerCompletionItemProvider(
    [
      'plaintext',
      {
        scheme: 'untitled',
        language: 'markdown',
      },
    ],
    {
      provideCompletionItems(document, position, token, context) {
        if (position.line === 3) {
          if (!notebooks) {
            return [];
          }
          if (notebooks.length === 0) {
            return [];
          }
          let completionItems = [];
          for (const notebook of notebooks!) {
            const completionItem = new vscode.CompletionItem(notebook.name);
            completionItem.kind = vscode.CompletionItemKind.Snippet;
            completionItems.push(completionItem);
          }
          return completionItems;
        }
      },
    }
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const publishNote = vscode.commands.registerCommand(
    'siyuan-note.publishNote',
    async () => {
      // The code you place here will be executed every time your command is executed
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor found.');
        return;
      }

      if (!serverConnected) {
        try {
          notebooks = await apiService.getNotebookList();
          serverConnected = true;
        } catch (err) {
          console.log(err);
        }
        if (notebooks && notebooks?.length > 0) {
          for (const notebook of notebooks) {
            notebookMaps.set(notebook.name, notebook.id);
            notebookMaps.set(notebook.id, notebook.name);
          }
        }
      }

      const document = editor.document;
      if (
        document.languageId !== 'markdown' &&
        !document.uri.fsPath.endsWith('.md')
      ) {
        vscode.window.showErrorMessage(
          'The actie file is not a Markdown file.'
        );
        return;
      }

      // TODO: deal with HTML content not rendering issue
      // TODO: should contains tags metadata

      const markdownRaw = document.getText();
      let notebook: string, title: string, subNotebook: string;

      // 提取 markdown 文件中的 metadata
      const { data, content } = matter(markdownRaw);
      notebook = data['notebook'];
      title = data['title'];
      subNotebook = data['subnotebook'];
      if (title === '') {
        title = '缺省标题';
      }

      // 检查 notebook 是否存在
      let notebookId, newNotebook;

      if (notebookMaps.has(notebook)) {
        notebookId = notebookMaps.get(notebook!);
      } else {
        // 不存在则新建 notebook
        try {
          newNotebook = await apiService.createNotebook(notebook);
        } catch (err) {
          console.log(err);
          return;
        }
        notebookId = newNotebook?.id;
        notebooks!.push(newNotebook);
        notebookMaps.set(notebook, notebookId);
        notebookMaps.set(notebookId, notebook);
      }

      // 检查是否有重名 note
      let notes;
      try {
        notes = await apiService.getNoteIdByPath(
          notebookId,
          subNotebook,
          title
        );
      } catch (err) {
        console.log(err);
        return;
      }

      // 删除所有重名 note
      if (notes.length) {
        for (const note of notes) {
          try {
            await apiService.deleteNoteById(note);
          } catch (err) {
            console.log(err);
            return;
          }
        }
      }

      try {
        const noteId = await apiService.createNoteFromMarkdown(
          notebookId,
          subNotebook,
          title,
          content
        );
        if (noteId && noteId !== '') {
          vscode.window.showInformationMessage('Note published!');
        }
      } catch (err) {
        console.log(err);
        return;
      }
    }
  );

  const newNote = vscode.commands.registerCommand(
    'siyuan-note.newNote',
    async () => {
      vscode.workspace
        .openTextDocument({
          language: 'markdown',
          content: '---\ntitle: \ntags: \nnotebook: \nsubnotebook: \n---',
        })
        .then(
          (document) => {
            vscode.window.showTextDocument(document).then((editor) => {
              const lineLength = document.lineAt(1).text.length;
              const position = new vscode.Position(1, lineLength);
              editor.selection = new vscode.Selection(position, position);
              editor.revealRange(new vscode.Range(position, position));
            });
          },
          (reason) => {
            vscode.window.showErrorMessage(
              `Failed to create new note, due to ${reason}`
            );
            return;
          }
        );
    }
  );

  context.subscriptions.push(provider);
  context.subscriptions.push(publishNote);
  context.subscriptions.push(newNote);
}

// This method is called when your extension is deactivated
export function deactivate() {}
