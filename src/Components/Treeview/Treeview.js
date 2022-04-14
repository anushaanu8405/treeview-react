import React, { useState, useEffect, useRef } from 'react';
import './Treeview.css';


const detailViewFields = [
    { displayLabel: 'Category', fieldKey: 'category' },
    { displayLabel: 'Title', fieldKey: 'title' },
    { displayLabel: 'Metric Name', fieldKey: 'metric_name' },
    { displayLabel: 'Metric Start', fieldKey: 'metric_start' },
    { displayLabel: 'Metric Target', fieldKey: 'metric_target' }
]

function Treeview() {

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredTreeRes, setFilteredTreeRes] = useState([]);
    const [treeRes, setTreeRes] = useState([]);
    const [filterOptions, setFilterOptions] = useState([]);
    const [selOption, setSelOption] = useState({});

    const dialogRef = useRef();


    // open detail dialog
    const detailDialogHandler = (data) => {
        dialogRef.current?.showModal();
        setSelOption(data)
    }

    // close detail dialog
    const closeDialogHandler = () => {
        dialogRef.current?.close();
        setSelOption({})
    }

    // Fetch data
    const fetchOKRData = () => {
        setIsLoading(true);
        fetch("https://okrcentral.github.io/sample-okrs/db.json")
            .then(res => res.json())
            .then(({ data }) => {
                setIsLoading(false);
                const treeResponse = formatTreeView(data);
                setTreeRes(treeResponse); // Original tree response
                setFilteredTreeRes(treeResponse);
                // For filter options
                const categoryOptions = treeResponse.map(option => option.category);
                const uniqueCategories = [...new Set(categoryOptions)];
                setFilterOptions(uniqueCategories);
            }, (error) => {
                setIsLoading(false);
                setError(error);
            });
    }

    // Format tree view from response
    const formatTreeView = (options = [], id = "") => {
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
                {type === 'parent' ? <details open>
                    {/* onClick={() => detailDialogHandler(option)} */}
                    <summary>{index + 1}. {option?.title}</summary>
                    {option?.children?.length ?
                        <ol type="a" className='child-view'>
                            {renderTreeView(option.children, 'children')}
                        </ol> : null}
                </details> :
                    <>
                        <li><a onClick={() => detailDialogHandler(option)}>{option?.title}</a></li>
                        {/* {option?.children?.length ? <ol type="a" className='child-view'>{renderTreeView(option.children, 'children')}</ol> : null} */}
                    </>}
            </div>
        ));
        return listItems;
    };

    // category filter change handler
    const filterChangeHandler = (event) => {
        if (event?.target?.value) {
            const filteredRes = [...treeRes].filter(option => option.category === event.target.value);
            setFilteredTreeRes(filteredRes);
        } else {
            setFilteredTreeRes(treeRes);
        }
    }



    return (
        <div className='container'>
            {
                error ? <div>Error: {error.message}</div> :
                    isLoading ? <div>Loading...</div> :
                        <>
                            <form className='filter-view'>
                                <label htmlFor="categories">Choose category:</label>
                                <select name="categories" id="categories" onChange={filterChangeHandler}>
                                    <option value="">Select All</option>
                                    {filterOptions.map(option => <option value={option} key={option}>{option}</option>)}
                                </select>
                            </form>
                            {renderTreeView(filteredTreeRes)}
                        </>

            }
            <dialog className="detail-dialog" ref={dialogRef}>
                <p>Detailed view</p>
                {
                    detailViewFields.map((option, index) => <dl className="row-view" key={index}>
                        <dt className='label-view'>{option?.displayLabel}:</dt>
                        <dd className='value-view'>{selOption?.[option?.fieldKey] || 'N/A'}</dd>
                    </dl>)
                }
                <button onClick={closeDialogHandler}>close</button>
            </dialog>
        </div >
    );
}

export default React.memo(Treeview);