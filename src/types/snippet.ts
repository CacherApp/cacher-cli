import { SnippetFile } from './snippet-file.js';

export interface Snippet {
  description: string;
  files: SnippetFile[];
  guid?: string;
  isPrivate: boolean;
  title: string;
}
