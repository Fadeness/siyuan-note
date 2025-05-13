import { HttpClient } from '../utils/httpClient.js';

interface CommonResponse<T> {
  msg: string;
  data: T;
  code: number;
}

interface Nootebook {
  id: string;
  name: string;
  icon: string;
  sort: number;
  closed: boolean;
}

interface NotebooksResponse {
  notebooks: Nootebook[];
}

interface NotebookResponse {
  notebook: Nootebook;
}

export class ApiService {
  private client: HttpClient;

  constructor(client?: HttpClient) {
    this.client = client || new HttpClient();
  }

  async getNotebookList(): Promise<Nootebook[]> {
    const response = await this.client.post<CommonResponse<NotebooksResponse>>(
      '/api/notebook/lsNotebooks'
    );
    return response.data.data.notebooks;
  }

  async createNotebook(notebookName: string): Promise<Nootebook> {
    const response = await this.client.post<CommonResponse<NotebookResponse>>(
      '/api/notebook/createNotebook',
      {
        data: {
          name: notebookName,
        },
      }
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
      }
    );
    return response.data.code === 0 ? true : false;
  }

  async getNoteIdByPath(
    notebookId: string,
    subNotebook: string,
    title: string
  ): Promise<string[]> {
    let path;
    if (!subNotebook || subNotebook === '') {
      path = `/${title}`;
    } else {
      path = `/${subNotebook}/${title}`;
    }
    const response = await this.client.post<CommonResponse<string[]>>(
      '/api/filetree/getIDsByHPath',
      {
        data: {
          path,
          notebook: notebookId,
        },
      }
    );
    return response.data.data;
  }

  async createNoteFromMarkdown(
    notebookId: string,
    subNotebook: string,
    title: string,
    markdown: string
  ) {
    let path;
    if (!subNotebook || subNotebook === '') {
      path = `/${title}`;
    } else {
      path = `/${subNotebook}/${title}`;
    }

    const response = await this.client.post<CommonResponse<string>>(
      '/api/filetree/createDocWithMd',
      {
        data: {
          notebook: notebookId,
          path,
          markdown,
        },
      }
    );
    return response.data.data;
  }
}
