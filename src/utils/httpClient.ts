import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as vscode from 'vscode';

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
}

export class HttpClient {
  private client: AxiosInstance;

  constructor() {
    // Load user configuration
    const config = vscode.workspace.getConfiguration('siyuan-note');
    const host = config.get<string>('host');
    const port = config.get<string>('port');
    const token = config.get<string>('token');
    const baseURL = 'http://' + host + ':' + port;

    this.client = axios.create({
      baseURL,
    });

    this.client.defaults.headers.common['Authorization'] = `Token ${token}`;
    this.client.defaults.headers.post['Content-Type'] = 'application/json';

    // Add responce interceptors for error handling
    this.client.interceptors.response.use(
      (res) => res,
      (err) => {
        this.handleError(err);
        return Promise.reject(err);
      }
    );

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration('siyuan-note.host') ||
        event.affectsConfiguration('siyuan-note.port') ||
        event.affectsConfiguration('siyuan-note.token')
      ) {
        this.updateClientConfig();
      }
    });
  }

  // Generic POST request
  async post<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, options.data, {
      headers: options.headers,
      params: options.params,
    });
  }

  // Update client configuration when settings change
  private updateClientConfig() {
    const config = vscode.workspace.getConfiguration('siyuan-note');
    const host = config.get<string>('host');
    const port = config.get<string>('port');
    const token = config.get<string>('token');
    const baseURL = 'http://' + host + ':' + port;

    this.client.defaults.baseURL = baseURL;
    this.client.defaults.headers.common['Authorization'] = `Token ${token}`;
  }

  // Error handling
  private handleError(err: any): void {
    let message = 'An error occurred while making the HTTP request';

    if (err.response) {
      message = `Request failed with status ${err.response.status}: ${
        err.response.data.msg || err.message
      }`;
    } else if (err.request) {
      message =
        'No response received from the server. Please check your network connection.';
    } else {
      message = err.message;
    }

    vscode.window.showErrorMessage(message);
  }
}
