import { HttpClient } from '../utils/httpClient.js';

interface CommonResponse<T> {
  msg: string
  data: T
  code: number
}

export interface Notebook {
  id: string
  name: string
  icon: string
  sort: number
  closed: boolean
}

interface NotebooksResponse {
  notebooks: Notebook[]
}

interface NotebookResponse {
  notebook: Notebook
}

export class ApiService {
  private client: HttpClient;

  constructor(client?: HttpClient) {
    this.client = client || new HttpClient();
  }

  async getNotebookList(): Promise<Notebook[]> {
    const response = await this.client.post<CommonResponse<NotebooksResponse>>(
      '/api/notebook/lsNotebooks',
    );
    return response.data.data.notebooks;
  }

  async createNotebook(notebookName: string): Promise<Notebook> {
    const response = await this.client.post<CommonResponse<NotebookResponse>>(
      '/api/notebook/createNotebook',
      {
        data: {
          name: notebookName,
        },
      },
    );
    return response.data.data.notebook;
  }

  async deleteNoteById(noteId: string): Promise<boolean> {
    const response = await this.client.post<CommonResponse<any>>(
      '/api/filetree/removeDocByID',
      {
        data: {
          id: noteId,
        },
      },
    );
    return response.data.code === 0 ? true : false;
  }

  async getNoteIdByPath(
    notebookId: string,
    path: string,
    title: string,
  ): Promise<string[]> {
    const response = await this.client.post<CommonResponse<string[]>>(
      '/api/filetree/getIDsByHPath',
      {
        data: {
          path: `${path}/${title}`,
          notebook: notebookId,
        },
      },
    );
    return response.data.data;
  }

  async createNoteFromMarkdown(
    notebookId: string,
    path: string,
    title: string,
    tags: string,
    markdown: string,
  ) {
    const response = await this.client.post<CommonResponse<string>>(
      '/api/filetree/createDocWithMd',
      {
        data: {
          notebook: notebookId,
          path: `${path}/${title}`,
          markdown,
          tags,
        },
      },
    );
    return response.data.data;
  }
}
