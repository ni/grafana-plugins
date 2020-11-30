import React from 'react';
import { TestMonitorVariableQuery } from './types';

interface VariableQueryProps {
    query: TestMonitorVariableQuery;
    onChange: (query: TestMonitorVariableQuery, definition: string) => void;
}

const fields = [{label: 'Program name', value: 'PROGRAM_NAME'}, {label: 'System', value: 'SYSTEM_ID'}, {label: 'Host name', value: 'HOST_NAME'}, {label: 'Operator', value: 'OPERATOR'}, {label: 'Serial number', value: 'SERIAL_NUMBER'}, {label: 'Part number', value: 'PART_NUMBER'}, {label: 'Workspace', value: 'WORKSPACE'}];

export const VariableQueryEditor: React.FC<VariableQueryProps> = ({ onChange, query }) => {

    const saveQuery = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({field: event.target.value}, 'Test Monitor variable');
    };

    if (!query.field) {
        onChange({ field: fields[0].value }, 'Test Monitor variable');
    }

    return (
        <>
            <div className="gf-form">
                <span className="gf-form-label width-10">Field</span>
                <div className="gf-form-select-wrapper max-width-12">
                    <select name="field" className="gf-form-input" value={query.field} onChange={saveQuery}>
                        {fields.map(field => <option {...field} />)}
                    </select>
                </div>
            </div>
        </>
    );
};