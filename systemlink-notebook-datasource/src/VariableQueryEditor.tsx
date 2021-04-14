import React, { useState, useEffect } from 'react';
import { getBackendSrv } from '@grafana/runtime';
import { Notebook, Parameter, NotebookParameterQuery } from './types';
import { DataSourceInstanceSettings } from '@grafana/data';
import { formatNotebookOption, formatPath } from 'utils';

interface NotebookVariableQueryProps {
  datasource: DataSourceInstanceSettings;
  query: NotebookParameterQuery;
  onChange: (query: NotebookParameterQuery, definition: string) => void;
}

export const VariableQueryEditor: React.FC<NotebookVariableQueryProps> = ({ datasource, onChange, query }) => {
  const [state, setState] = useState(query);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [params, setParams] = useState<Parameter[]>([]);

  useEffect(() => {
    onChange(state, `${formatPath(state.path)} (${state.parameter})`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setState({
      ...state,
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  useEffect(() => {
    getBackendSrv()
      .post(datasource.url + '/ninbexec/v2/query-notebooks', {})
      .then((response: any) => {
        const notebooks = response.notebooks as Notebook[];
        setNotebooks(notebooks.filter((notebook) => notebook.metadata.version === 2));
        if (notebooks.length) {
          setState({
            ...state,
            path: notebooks[0].path,
          });
        }
      })
      .catch((e: any) => {
        throw new Error(`The query for SystemLink notebooks failed with error ${e.status}: ${e.statusText}.`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const notebook = notebooks.find((n) => n.path === state.path);
    if (!notebook) {
      return;
    }

    const allParams = Array.isArray(notebook.metadata.parameters) ? notebook.metadata.parameters : [];
    const enumParams = allParams.filter((param) => !!param.options);
    setParams(enumParams);
    setState({
      ...state,
      parameter: enumParams[0] ? enumParams[0].id : '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebooks, state.path]);

  return (
    <>
      <div className="gf-form">
        <span className="gf-form-label width-10">Path</span>
        <div className="gf-form-select-wrapper max-width-24">
          <select name="path" className="gf-form-input" value={state.path} onChange={handleChange}>
            {notebooks.map((notebook) => (
              <option key={notebook.path} {...formatNotebookOption(notebook)} />
            ))}
          </select>
        </div>
      </div>
      <div className="gf-form">
        <span className="gf-form-label width-10">Parameter</span>
        <div className="gf-form-select-wrapper max-width-12">
          <select name="parameter" className="gf-form-input" value={state.parameter} onChange={handleChange}>
            {params.map((param) => (
              <option key={param.id} {...{ label: param.display_name, value: param.id }} />
            ))}
          </select>
        </div>
      </div>
    </>
  );
};
