import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import DoctorModal from './DoctorModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CheckBox from 'devextreme-react/check-box';
import { DeleteConfirmationModal } from '../../components';
import { LoadPanel } from 'devextreme-react/load-panel';
import DataGrid, {

    Column,
    Button as GridButton,
    Editing,
    HeaderFilter,
    FilterRow,
    Sorting,
    Scrolling,
    Grouping,
    GroupPanel,
    Selection,
    MasterDetail,
    Summary,
    TotalItem,
    Lookup,
    Popup,
    Paging,
    Pager,
    RequiredRule,
    AsyncRule
} from 'devextreme-react/data-grid';
import DetailTemplate from './DetailTemplate';
const DoctorList = ({ darkMode }) => {
    const token = localStorage.getItem("token");
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctorsList, setDoctorsList] = useState([]);
    const [specialtiesList, setSpecialtiesList] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteDoctorId, setDeleteDoctorId] = useState(null);
    const initialData = {
        DoctorName: "",
        SpecialityID: null,
        Education: "",
    }
    const [doctor, setDoctor] = useState(initialData);
    // const initialErrors = {
    //     DoctorName: false,
    //     SpecialityID: false,
    //     Education: false,
    // }
    // const [doctorError, setDoctorError] = useState(initialErrors)
    const [inUseError, setInUseError] = useState(false)
    const [duplicateError, setDuplicateError] = useState(false)
    const deleteMessage = "Are you sure you want to delete this Doctor?"

    useEffect(() => {
        if (!token) {
            navigate('/')
        }
    }, [])



    const fetchDoctorList = async () => {
        setLoadPanelVisible(true)
        try {
            setTimeout(async () => {
                const response = await axios.get('https://localhost:7137/api/Doctor/GetList', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const doctorList = response.data;
                setDoctorsList(doctorList)
                console.log('Doctor list:', doctorList);
                setLoadPanelVisible(false)
            }, 500)

        } catch (error) {
            console.error('Error fetching doctor list:', error.message);
            setLoadPanelVisible(false)
        }
    }

    const fetchSpecialtyList = async () => {
        try {
            const response = await axios.get('https://localhost:7137/api/Speciality/GetLookupList', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const specialities = response.data;
            setSpecialtiesList(specialities)
            console.log('Speciality list:', specialities);
        } catch (error) {
            console.error('Error fetching speciality list:', error.message);
        }
    }

    useEffect(() => {
        fetchDoctorList();
        fetchSpecialtyList();
    }, [])

    const handleAddClick = () => {
        setSelectedDoctor(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // setDoctorError(initialErrors)
        setDoctor(initialData)
        setDuplicateError(false)
    };

    const validateDoctor = () => {
        debugger
        let hasError = false;
        const newErrors = {};
        for (const key in doctor) {
            if (!doctor[key]) {
                newErrors[key] = true;
                hasError = true;
            } else {
                newErrors[key] = false;
            }
        }
        // setDoctorError(newErrors);
        return hasError;
    };

    const handleSaveDoctor = async (e) => {
        e.preventDefault();
        console.log("donctor on save", doctor)
        console.log("Selected save Doctor", selectedDoctor)
        debugger
        if (validateDoctor()) {
            return;
        }
        if (selectedDoctor) {
            console.log("Selected Doctor", selectedDoctor)
            const updatedDoctorData = {
                doctorID: selectedDoctor.DoctorID,
                doctorName: doctor.DoctorName,
                specialityID: doctor.SpecialityID,
                education: doctor.Education
            }
            try {
                const response = await axios.put(`https://localhost:7137/api/Doctor/Update/`, updatedDoctorData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                fetchDoctorList();
                setDoctor(initialData)
                console.log('Doctor updated successfully:');
                setIsModalOpen(false);
            } catch (error) {
                console.error('Error updating doctor:', error.message);
                if (error.response.data.includes("Cannot accept duplicate doctor name")) {
                    setDuplicateError(true);
                }
            }

        } else {
            // Add New Doctor
            try {
                const data = {
                    doctorName: doctor?.DoctorName,
                    specialityID: doctor?.SpecialityID,
                    education: doctor?.Education
                }
                const response = await axios.post('https://localhost:7137/api/Doctor/Insert', data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                fetchDoctorList();
                setDoctor(initialData)
                console.log('Doctor inserted successfully:');
                setIsModalOpen(false);
            } catch (error) {
                console.error('Error inserting doctor:', error.message);
                if (error.response.data.includes("Cannot accept duplicate doctor name")) {
                    setDuplicateError(true);
                }
            }
        }

    };

    const handleEditDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleDeleteDoctor = async (id) => {
        setDeleteDoctorId(id)
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirmed = async () => {
        try {
            const response = await axios.delete(`https://localhost:7137/api/Doctor/Delete/${deleteDoctorId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchDoctorList();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting item:', error.message);
            if (error.response.data.includes("Selected record exists in Patients")) {
                setInUseError(true);
            }
        }
    };



    const handleChange = useCallback((name, args) => {
        // const { name, value } = args;
        console.log("args", name, args)
        setDoctor(prevState => ({
            ...prevState,
            [name]: args
        }));
        // setDoctor((prevDoctor) => ({
        //   ...prevDoctor,
        //   SpecialityID: args.value // Update SpecialityID with the new value from args
        // }));
    }, []);


    const handleSpecialtyChange = useCallback((args) => {
        setDoctor((prevDoctor) => ({
            ...prevDoctor,
            SpecialityID: args.value
        }));
    }, []);


    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        setInUseError(false)
    };
    const calculateSerialNumber = (rowIndex) => {
        return rowIndex + 1;
    };
    const renderActionButtons = (data) => {
        console.log(data.data.DoctorID)
        return (
            <td>
                <Button variant="info" onClick={() => handleEditDoctor(data.data)} className="mx-2">Edit</Button>
                <Button variant="danger" onClick={() => handleDeleteDoctor(data.data.DoctorID)}>Delete</Button>
            </td>
        );
    };






    async function sendBatchRequest(url, changes) {
        console.log("chnages", changes[0].data, url)
        const updatedDoctorData = {
            ...changes[0].key, ...changes[0].data
        }
        const finalData = {

            doctorID: updatedDoctorData.DoctorID,
            doctorName: updatedDoctorData.DoctorName,
            specialityID: updatedDoctorData.SpecialityID,
            education: updatedDoctorData.Education

        }
        console.log("FinalDoctorData", finalData)
        try {
            const response = await axios.put(`${url}`, finalData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            fetchDoctorList()
        } catch (error) {
            console.error('Error updating doctor:', error.message);
            // if (error.response.data.includes("Cannot accept duplicate doctor name")) {
            //     setDuplicateError(true);
            // }
        }

    }
    async function processBatchRequest(url, changes, component) {
        console.log("promiseBatch", changes, component)
        await sendBatchRequest(url, changes);
        await component.refresh(true);
        component.cancelEditData();
    }
    const onSaving = (e) => {
        debugger
        console.log("eChanges", e)
        e.cancel = true;
        if (e.changes.length) {
            e.promise = processBatchRequest(`${"https://localhost:7137/api/Doctor/Update/"}`, e.changes, e.component);
        }
    };





    const [autoExpandAll, setAutoExpandAll] = useState(true);
    const onAutoExpandAllChanged = useCallback(() => {
        setAutoExpandAll((previousAutoExpandAll) => !previousAutoExpandAll);
    }, []);

    const selectionFilter = ['Task_Status', '=', 'Completed'];
    // const [checkBoxesMode, setCheckBoxesMode] = useState(
    //     current().startsWith('material') ? 'always' : 'onClick',
    //   );
    //   const onCheckBoxesModeChanged = useCallback(({ value }) => {
    //     setCheckBoxesMode(value);
    //   }, []);

    console.log("detailtemplate", doctorsList)

    const onFocusedRowChanging = useCallback(async (e) => {
        const rowsCount = e.component.getVisibleRows().length;
        const pageCount = e.component.pageCount();
        const pageIndex = e.component.pageIndex();
        const event = e?.event;
        const key = event.key;
        if (key && e.prevRowIndex === e.newRowIndex) {
            if (e.newRowIndex === rowsCount - 1 && pageIndex < pageCount - 1) {
                await e.component.pageIndex(pageIndex + 1);
                e.component.option('focusedRowIndex', 0);
            } else if (e.newRowIndex === 0 && pageIndex > 0) {
                await e.component.pageIndex(pageIndex - 1);
                e.component.option('focusedRowIndex', rowsCount - 1);
            }
        }
    }, []);

    const onFocusedRowChanged = useCallback((e) => {
        const data = e.row.data;
        const progress = data.Task_Completion ? `${data.Task_Completion}%` : '';
        // setTaskSubject(data.Task_Subject);
        // setTaskDetails(data.Task_Description);
        // setTaskStatus(data.Task_Status);
        // setTaskProgress(progress);
        // setFocusedRowKey(e.component.option('focusedRowKey'));
    }, []);

    const [autoNavigateToFocusedRow, setAutoNavigateToFocusedRow] = useState(true);
    const onAutoNavigateToFocusedRowChanged = useCallback((e) => {
        setAutoNavigateToFocusedRow(e.value);
    }, []);

    const [focusedRowKey, setFocusedRowKey] = useState(2);

    const formattedSpecialtyOptions = specialtiesList.map(specialty => ({
        Name: specialty.SpecialityName,
        ID: specialty.SpecialityID
    }));

    const [loadPanelVisible, setLoadPanelVisible] = useState(false);
    const hideLoadPanel = useCallback(() => {
        setLoadPanelVisible(false);
        //   setEmployeeInfo(employee);
    }, [setLoadPanelVisible]);
    const onClick = useCallback(() => {
        //   setEmployeeInfo({});

        setLoadPanelVisible(true);
        setTimeout(() => { hideLoadPanel(); fetchDoctorList() }, 1000);
    }, []);

    
    async function sendRequest(value) {
        debugger
        try {
            const response = await axios.get(`https://localhost:7137/api/Doctor/CheckDuplicateDoctorName/${value}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if(response.status == 200){
                return true
            }else{
                return false;
            }
        } catch (error) {
            console.error('Error checking duplicate item name:', error);
            return false;
        }   
    }



    function asyncValidation(params,row) {
        console.log("params from edit",params,row)
        return sendRequest(params.value);
    }



    return (
        <React.Fragment>
            <h2 className={'content-block'}>Doctor List</h2>
            <div className="w-100 d-flex justify-content-between my-2" >
                <Button variant="primary" onClick={onClick}>Load</Button>
                <Button variant="primary" onClick={handleAddClick}>Add</Button>
            </div>
            <LoadPanel
                shadingColor="rgba(0,0,0,0.4)"
                onHiding={hideLoadPanel}
                visible={loadPanelVisible}
            // hideOnOutsideClick={hideOnOutsideClick}
            />
            <DataGrid
                id="dataGrid"
                allowColumnReordering={true}
                dataSource={doctorsList}
                showBorders={true}
                onSaving={onSaving}
                defaultSelectionFilter={selectionFilter}
            // focusedRowEnabled={true}
            // focusedRowKey={focusedRowKey}
            // autoNavigateToFocusedRow={autoNavigateToFocusedRow}
            // onFocusedRowChanging={onFocusedRowChanging}
            // onFocusedRowChanged={onFocusedRowChanged}
            >
                <Paging defaultPageSize={10} />
                <Pager showPageSizeSelector={true} showInfo={true} />
                {/* <Scrolling mode="standard" /> */}
                <Popup
                    title="Employee Info"
                    showTitle={true}
                    width={700}
                    height={525}
                />
                <Editing
                    mode="batch"
                    // allowAdding={true}
                    allowDeleting={true}
                    allowUpdating={true}
                    startEditAction='dblClick'
                />
                <Selection
                    mode="multiple"
                    //   selectAllMode={allMode}
                    showCheckBoxesMode={"onClick"}
                />
                <Grouping autoExpandAll={autoExpandAll} />
                <GroupPanel visible={true} /> {/* or "auto" */}
                <Sorting mode="multiple" />
                <FilterRow visible={true} />
                <HeaderFilter visible={true} allowSearch="true" />
                <Column dataField="DoctorName" caption="Doctor Name"
                    minWidth={250}
                >
                    <RequiredRule />
                    <AsyncRule
                        message="Doctor Name is not unique"
                        validationCallback={(row,params)=>asyncValidation(row,params)}
                    />
                </Column>
                <Column dataField="SpecialityID" caption='Speciality Name' minWidth={250}>
                    <Lookup
                        dataSource={formattedSpecialtyOptions}
                        displayExpr="Name"
                        valueExpr="ID"
                    />
                </Column>
                <Column dataField="Education" caption='Education'
                    // groupIndex={1}
                    minWidth={250}
                >
                    <RequiredRule />
                </Column>
                <Column type='buttons' minWidth={100} >
                    <GridButton
                        text="Edit"
                        icon="edit"
                        onClick={(row) => handleEditDoctor(row.row.data)}
                    />
                    <GridButton
                        text="Delete"
                        icon="trash"
                        onClick={(row) => handleDeleteDoctor(row.row.data.DoctorID)}
                    />

                </Column>
                <MasterDetail
                    enabled={true}
                    component={DetailTemplate}
                />
                <Summary>
                    <TotalItem
                        column="DoctorName"
                        summaryType="count"
                    />
                </Summary>
            </DataGrid>
            <CheckBox
                text="Expand All Groups"
                id="autoExpand"
                value={autoExpandAll}
                onValueChanged={onAutoExpandAllChanged}
            />
            {isModalOpen && <DoctorModal
                show={isModalOpen}
                handleClose={handleCloseModal}
                handleSave={handleSaveDoctor}
                selectedDoctor={selectedDoctor}
                doctor={doctor}
                handleChange={handleChange}
                setDoctor={setDoctor}
                // doctorError={doctorError}
                specialtiesList={specialtiesList}
                handleSpecialtyChange={handleSpecialtyChange}
                darkMode={darkMode}
                duplicateError={duplicateError}
            />}

            <DeleteConfirmationModal
                show={isDeleteModalOpen}
                handleClose={handleDeleteModalClose}
                handleDelete={handleDeleteConfirmed}
                deleteMessage={deleteMessage}
                darkMode={darkMode}
                inUseError={inUseError}
            />
        </React.Fragment>
    );
};

export default DoctorList;
