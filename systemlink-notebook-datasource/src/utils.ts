import { SelectableValue } from '@grafana/data';
import { Notebook } from 'types';

export const timeout = (ms: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

export const formatPath = (path: string): string => {
  if (!path) {
    return '';
  }

  if (path.startsWith('_shared')) {
    return path.substring(1);
  }

  return path.substring(path.indexOf('/'));
}

export const formatNotebookOption = (notebook: Notebook): SelectableValue => {
  const path = notebook.path;
  return {
    label: formatPath(path),
    value: path,
  };
};
