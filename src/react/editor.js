import React from 'react'
import { GlobalStore } from './store'
import { Input, Button, Form, Popconfirm } from 'antd';

const Editor = (props) => {
    const [globalState, dispatch] = React.useContext(GlobalStore)
    const { getFieldDecorator, setFieldsValue } = props.form;

    const cols = ['_id', ...globalState.langs];

    const checkUndefined = (obj) => {
        for (var k in obj) {
            if (obj[k] === undefined) obj[k] = ''
        }
        return obj;
    }

    const onSave = e => {
        e.preventDefault();
        props.form.validateFields((err, values) => {
            values = checkUndefined(values)
            if (!err) {
                if (globalState.selectedData._key) dispatch({ type: 'updateRow', payload: values })
                else dispatch({ type: 'insertNewRow', payload: values })
            }
        });
    }

    React.useEffect(() => {
        if (globalState.selectedData) {
            const d = globalState.selectedData;
            let v = { '_id': d['_id'] }
            globalState.langs.forEach(e => {
                v[e] = d[e]
            });
            setFieldsValue(v)
        }
    }, [globalState.selectedData])

    const handleDelete = v => {
        dispatch({ type: 'removeRow', payload: v })
    }

    const validText = (rule, value, callback) => {
        const re = /^[a-zA-Z].*$/
        const re2 = /\w+$/;
        if (!re.test(value)) callback([new Error('must start with alpha')])
        else if (!re2.test(value)) callback([new Error('only alpha, number and _ allowed')])
        callback()
    }

    const keyNotExist = (rule, value, callback) => {
        const arr = globalState.data[globalState.currentGroup];
        const key = globalState.currentKey;
        const found = arr.find(v => v._key !== key && v._id === value)
        !found ? callback() : callback([new Error('Key already exist')])
    }

    return <Form style={{ marginLeft: 10 }} onSubmit={onSave}>
        {globalState.selectedData && <React.Fragment>
            {cols.map(v => {
                return <div style={{ marginBottom: 10 }} key={v}>
                    <div>{v}</div>
                    <Form.Item>
                        {getFieldDecorator(v, {
                            rules: v === '_id' ? [{ required: true, message: 'id required' }, { validator: validText }, { validator: keyNotExist }] : null,
                            //initialValue: globalState.selectedData[v],
                        })(
                            <Input.TextArea style={{ width: '100%' }} autosize />,
                        )}
                    </Form.Item>
                </div>
            })}
            <Button.Group>
                <Button type="default" htmlType="submit" icon="save" loading={globalState.saving}>Save</Button>
                <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(globalState.selectedData._key)}>
                    <Button type="danger" htmlType="submit" icon="delete">Remove</Button>
                </Popconfirm>
            </Button.Group>
            <Button style={{ marginLeft: 10 }} icon="plus" onClick={() => dispatch({ type: 'addRow' })}>Add new</Button>
        </React.Fragment>}
    </Form>
}

export default Form.create()(Editor);