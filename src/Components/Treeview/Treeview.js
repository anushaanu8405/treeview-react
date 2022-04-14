import React, { useState, useEffect } from 'react';
import './Treeview.css';

function Treeview() {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [originalRes, setOriginalRes] = useState([]);
    const [treeRes, setTreeRes] = useState([]);

    // Fetch data
    const fetchOKRData = () => {
        setIsLoading(true);
        fetch("https://okrcentral.github.io/sample-okrs/db.json")
            .then(res => res.json())
            .then(({ data }) => {
                setIsLoading(false);
                setOriginalRes(data);
                const treeRes = formatTreeView(data);
                setTreeRes(treeRes);
            }, (error) => {
                setIsLoading(false);
                setError(error);
            });
    }

    // Format tree view from response
    const formatTreeView = (options, id = "") => {
        return options.filter((item) => {
            if (id) {
                return item["parent_objective_id"] === id;
            } else {
                return item.parent_objective_id === '';
            }
        }).map((item) => ({
            ...item,
            children: formatTreeView(options, item.id),
        }));
    };


    useEffect(() => {
        fetchOKRData();
    }, []);


    // render tree view
    const renderTreeView = (options = [], type = 'parent') => {
        if (!options?.length) {
            return null
        }
        const listItems = options.map((option, index) => (
            <div key={option.id} className="tree-item">
                {type === 'parent' ? <details>
                    <summary>{index + 1}. {option?.title}</summary>
                    {option?.children?.length ?
                        <ol type="a" className='child-view'>
                            {renderTreeView(option.children, 'children')}
                        </ol> : null}
                </details> :
                    <>
                        <li>{option?.title}</li>
                        {/* {option?.children?.length ? <ol type="a" className='child-view'>{renderTreeView(option.children, 'children')}</ol> : null} */}
                    </>}
            </div>
        ));
        return listItems;
    };

    return (
        <div className='container'>
            {
                error ? <div>Error: {error.message}</div> :
                    isLoading ? <div>Loading...</div> :
                        <ol> {renderTreeView(treeRes)}</ol>
            }
        </div>
    );
}

export default React.memo(Treeview);