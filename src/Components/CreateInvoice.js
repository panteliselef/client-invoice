import React, {useState, useEffect, useContext} from 'react';
import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/auth';
import 'firebase/database';

// Components
import {NavLink} from 'react-router-dom';
import Header from './Header';
import ExpansionPanel from './ExpansionPanel/ExpansionPanel';

// Utils
import createInvoice from '../Utils/invoicePDF';
import {
    getCurrencySymbol,
    calculateFees,
    calculateSubTotal,
    calculateTotal,
    formatForCurrency,
    formatInvoiceNumber,
    categoryOptions
} from '../Utils/utils';

// CSS
import '../Assets/styles/invoice-form.css';

// Images
import companyLogo from '../Assets/twologo.png';
import arrowBox from '../Assets/arrow-left-box.svg';
import {AppContext} from "../App";
import {actions} from "../Actions/mainActions";

const CreateInvoice = (props) => {
    const {dispatch, state} = useContext(AppContext);
    const database = firebase.database();
    const firebaseFiles = database.ref(`/files/${props.uid}/invoices`);

    const currencyOptions = [
        'USD',
        'EURO',
        'RSD'
    ];

    const [linvoiceNumber, setlInvoiceNumber] = useState(0);
    const [refTolInvoiceNumber, setRefTolInvoiceNumber] = useState();
    const [activeCurrency, setActiveCurrency] = useState(currencyOptions[0])
    // const [activeCategory, setActiveCatergory] = useState(categoryOptions[0])
    const [clients, setClients] = useState([]);
    const [clientInfo, setClientInfo] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        place_issued: '',
        c_pib: '',
        c_mb: ''
    });


    useEffect(() => {
        refTolInvoiceNumber && refTolInvoiceNumber.once('value', (snapshot) => {
            setlInvoiceNumber(snapshot.val());
        });
    }, [refTolInvoiceNumber])

    useEffect(() => {
        const {uid} = props;
        const firebaseClientsRef = database.ref(`/clients/${props.uid}/`);
        const fetchAllClients = () => {
            let clients = []
            firebaseClientsRef.once('value', (snapshot) => {
                snapshot.forEach((child) => {
                    clients.push(child.val());
                });
            });

            setClients(clients);
        };

        setRefTolInvoiceNumber(firebase.database().ref(`users/${uid}/appInfo/linvoiceNumber`));
        fetchAllClients()
    }, [props, database]);

    const [invoiceItems, setInvoiceItems] = useState([
        {
            id: 1,
            description: "",
            uprice: 0,
            qty: 1
        }
    ]);

    const [nameOfProject, setNameOfProject] = useState('');
    const [isEverythingDisabled, setDisabled] = useState(false);
    const [readyToUpload, setReadyToUpload] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [uploadedPercentage, setUploadedPercentage] = useState(0);
    const [uploadCompleted, setUploadCompleted] = useState(false);

    const [feesPercent, setFeesPercent] = useState(18);
    const [discountAmnt, setDiscountAmnt] = useState(0);


    const generatePDFName = (iNumber, projectName) => {
        /**
         * Replacing white spaces, '/', '\' with '-' (dash)
         */
        return `invoice${formatInvoiceNumber(iNumber)}${projectName.replace(new RegExp(/[\s\/\\]+/, "g"), '-')}.pdf`;
    }

    const checkForDuplicatePdf = () => {
        return new Promise((resolve, reject) => {
            firebaseFiles.once('value', (snapshot) => {
                snapshot.forEach((child) => {
                    console.log(child.val().metadata.name, generatePDFName(linvoiceNumber, nameOfProject));
                    if (generatePDFName(linvoiceNumber, nameOfProject) === child.val().metadata.name)
                        reject({error: new Error('Found duplicate file'), id: child.key});
                });
                resolve(true);
            });
        });
    };

    const updateItemDescription = (item, value) => {
        let n = invoiceItems.map((it) => {
            if (it.id === item.id) it.description = value;
            return it;
        });
        setInvoiceItems(n);
    };
    const updateItemQuantity = (item, value) => {
        let n = invoiceItems.map((it) => {
            if (it.id === item.id) it.qty = +value;
            return it;
        });
        setInvoiceItems(n);
    };
    const updateItemPrice = (item, value) => {
        let n = invoiceItems.map((it) => {
            if (it.id === item.id) it.uprice = +value;
            return it;
        });
        setInvoiceItems(n);
    };

    const uploadPDFToDatabase = (metadata) => {
        let user = firebase.auth().currentUser;

        console.log(metadata = {
            ...metadata,
            invoiceCatergory: state.activeCategory,
            invoiceCurrency: activeCurrency
        })
        database.ref(`/files/${user.uid}/invoices/`).push({
            metadata: {
                ...metadata,
                invoiceCatergory: state.activeCategory,
                invoiceCurrency: activeCurrency
            }
        });
    };

    const uploadPDFToStorage = (file) => {
        let user = firebase.auth().currentUser;

        let storageRef = firebase.storage().ref(`/${user.uid}/invoices/${generatePDFName(linvoiceNumber, nameOfProject)}`);
        console.log(firebase.auth().currentUser);

        let metadata = {
            cacheControl: 'public,max-age=300',
            contentLanguage: 'en',
            contentType: 'application/pdf',
            customMetadata: {
                timestamp: Date.now()
            }
        };
        let task = storageRef.put(file, metadata);
        task.on(
            'state_changed',
            function progress(snapshot) {
                let percentage = snapshot.bytesTransferred / snapshot.totalBytes * 100;
                console.log(percentage);
                setUploadedPercentage(percentage);
            },
            function error(err) {
                console.error(err);
                setDisabled(false)
            },
            function completed() {
                document.getElementById('progress-bar-colored').style.backgroundColor = '#192466';
                setUploadCompleted(true);
                storageRef
                    .getMetadata()
                    .then(function (metadata) {
                        uploadPDFToDatabase(metadata);
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            }
        );
    };

    const uploadPDF = (file) => {
        setReadyToUpload(true);
        uploadPDFToStorage(file);
    };

    const addItemtoList = () => {
        setInvoiceItems([
            ...invoiceItems,
            {
                id: Date.now(),
                description: '',
                uprice: 0,
                qty: 1
            }
        ]);
    };


    const checkPdf = (invoiceData) => {

        invoiceData.invoiceNumber = linvoiceNumber;
        invoiceData.currency = activeCurrency;
        invoiceData.lang = state.activeCategory;

        if (!nameOfProject) {
            setShowErrors(true)
            return
        }

        setDisabled(true)

        checkForDuplicatePdf()
            .then((msg) => {
                console.log('SUCESS', msg);
                let file = createInvoice(invoiceData)
                refTolInvoiceNumber.set(linvoiceNumber + 1);
                uploadPDF(file);
            })
            .catch((obj) => {
                console.error(obj.error);
                if (window.confirm('You already have a pdf with this name. Would you like to replace it ?')) {
                    let file = createInvoice(invoiceData)
                    let fileToBeDeleted = database.ref(`/files/${props.uid}/invoices/${obj.id}`);
                    fileToBeDeleted.remove().then((val) => {
                        refTolInvoiceNumber.set(linvoiceNumber + 1);
                        uploadPDF(file);
                    });
                } else {
                    //no
                }
            });

    };

    const fillClientInfoOfClient = (e) => {
        const clientName = e.target.value
        const clientFound = clients.find(client => client.name === clientName);
        if (!clientFound) return
        setClientInfo(clientFound)
    }

    return (
        <div className="container"
             style={{width: '100%'}}
        >
            <Header/>
            <form name="invoice-form" className="invoice-form">
                <div style={{display: 'none'}}>
                    <img id="img-logo" width="100" height="100" src={companyLogo} alt="invisible"/>
                </div>
                <div className="h-flex align-center space-between" style={{flexWrap: 'wrap'}}>
                    <div className="h-flex align-center">
                        <NavLink to="/dashboard">
                            <img src={arrowBox} width="30" height="30" alt='go-back-arrow'/>
                        </NavLink>
                        <div className="page-title" style={{marginLeft: '.5rem'}}>
                            Client Info
                        </div>
                    </div>

                    <div>
                        <select value={state.activeCategory} style={{marginLeft: 'auto', padding: '.5rem'}} onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'Serbian') {
                                setActiveCurrency('RSD')
                            }
                            dispatch({type: actions.UPDATED_CATEGORY, payload: e.target.value})
                        }}>
                            {categoryOptions.map((option, index) =>
                                <option key={index} value={option}>{option}</option>
                            )}
                        </select>

                        <select style={{padding: '.5rem'}} defaultValue="Select Client"
                                onChange={fillClientInfoOfClient}>
                            <option value="Select Client" disabled={true}>Select Client</option>
                            {clients.map(({name}) =>
                                <option key={name} value={name}>{name}</option>
                            )}
                        </select>
                    </div>


                </div>
                <div className="client-info-inputs">
                    <div className="inputs">
                        <input
                            onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                            value={clientInfo.name}
                            placeholder="Name"
                        />
                        <input
                            onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                            value={clientInfo.email}
                            placeholder="Email"
                            type="email"
                        />
                        <input
                            onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
                            value={clientInfo.address}
                            placeholder="Address"
                        />
                        <input
                            onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                            value={clientInfo.phone}
                            placeholder="Phone"
                            type="tel"
                        />
                    </div>


                    <h2 style={{display: state.activeCategory !== 'Serbian' && 'none'}}>Serbian Info</h2>
                    <div className="inputs" style={{display: state.activeCategory !== 'Serbian' && 'none'}}>

                        <input
                            onChange={(e) => setClientInfo({...clientInfo, place_issued: e.target.value})}
                            value={clientInfo.place_issued}
                            placeholder="Place Issued"
                            type="text"
                        />

                        <input
                            onChange={(e) => setClientInfo({...clientInfo, c_pib: e.target.value})}
                            value={clientInfo.c_pib}
                            placeholder="Client PIB"
                            type="text"
                        />

                        <input
                            onChange={(e) => setClientInfo({...clientInfo, c_mb: e.target.value})}
                            value={clientInfo.c_mb}
                            placeholder="Client MB"
                            type="text"
                        />
                    </div>


                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap'
                }}>

                    <input
                        id="name-of-project"
                        placeholder="Project Name"
                        required={true}
                        disabled={isEverythingDisabled}
                        className={(!nameOfProject && showErrors) ? 'input-with-label error' : 'input-with-label'}
                        onChange={(e) => setNameOfProject(e.target.value)}
                        value={nameOfProject}
                    />
                    {
                        (!nameOfProject && showErrors) &&
                        <label style={{marginLeft: '1rem'}} className={'error'} htmlFor="name-of-project">Please add
                            project title</label>
                    }


                    <select disabled={state.activeCategory === 'Serbian'}
                            style={{marginTop: '.4rem', marginLeft: 'auto', padding: '.5rem'}} value={activeCurrency}
                            onChange={(e) => {
                                console.log(e.target.value)
                                setActiveCurrency(e.target.value)
                            }}>

                        <option value={activeCurrency}>{activeCurrency}</option>
                        {currencyOptions.filter(option => option !== activeCurrency).map((option, index) =>
                            <option key={index} value={option}>{option}</option>
                        )}
                    </select>


                </div>


                <div className="item-description-table">
                    <div className="entry-title">
                        <div>#</div>
                        <div>Item Description</div>
                        <div>Quantity</div>
                        <div>Price</div>
                    </div>
                    {invoiceItems.map((item) => {
                        return (
                            <div key={item.id} className="entry">
                                <div style={{cursor: 'pointer', height: "100%", display: 'flex', alignItems: 'center'}}
                                     onClick={() => {
                                         const newList = invoiceItems.filter((item_) => item_.id !== item.id);

                                         setInvoiceItems(newList);

                                     }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#192466"
                                         width="24px" height="24px">
                                        <path d="M0 0h24v24H0z" fill="none"/>
                                        <path
                                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
                                    </svg>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="item name"
                                        value={item.description}
                                        onChange={(e) => updateItemDescription(item, e.target.value)}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        value={item.qty}
                                        placeholder="Qnt"
                                        onChange={(e) => updateItemQuantity(item, e.target.value)}
                                        pattern="[0-9]*"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        value={item.uprice}
                                        placeholder="price"
                                        onChange={(e) => updateItemPrice(item, e.target.value)}
                                        pattern="[0-9]*"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>


                <div className="button-area">
                    <div onClick={() => addItemtoList()} className="button">
                        + add Item
                    </div>
                </div>
                <div className="client-total-bill">
                    <div className='emphasis'>Sub
                        Total {formatForCurrency(activeCurrency, calculateSubTotal(invoiceItems))}</div>
                </div>


                <ExpansionPanel isOpen={true} title="Fees & Discount">

                    <div className="fees-grid">
                        <div style={{
                            textAlign: 'right',
                            fontWeight: 'bold'
                        }}>
                            Fees %
                        </div>
                        <input className="invoice-input"
                               type="number"
                               value={feesPercent}
                               onChange={(e) => setFeesPercent(+e.target.value)}
                               pattern="[0-9]*"
                        />


                        <div style={{
                            textAlign: 'right',
                            fontWeight: 'bold'
                        }}>
                            Discount {getCurrencySymbol(activeCurrency)}
                        </div>
                        <input className="invoice-input"
                               type="number"
                               value={discountAmnt}
                               onChange={(e) => setDiscountAmnt(+e.target.value)}
                               pattern="[0-9]*"
                        />
                    </div>

                </ExpansionPanel>


                <div className="client-total-bill">

                    <div style={{
                        width: 'auto',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        alignItems: 'center',
                        gap: '5px'
                    }}>

                        <div style={{
                            textAlign: 'right',
                            fontWeight: 'bold'
                        }}>
                            Fees
                        </div>

                        <div style={{
                            textAlign: 'right',
                            fontWeight: 'bold'
                        }}>+ {formatForCurrency(activeCurrency, calculateFees(invoiceItems, feesPercent))}</div>


                        <div style={{
                            textAlign: 'right',
                            fontWeight: 'bold'
                        }}>
                            Discount
                        </div>

                        <div style={{
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: 'green'
                        }}>- {formatForCurrency(activeCurrency, discountAmnt)}</div>

                    </div>

                    <div className='emphasis'
                         style={{marginTop: '1rem'}}>Total {formatForCurrency(activeCurrency, calculateTotal({
                        items: invoiceItems,
                        fees: feesPercent,
                        discount: discountAmnt
                    }))}  </div>


                </div>

                <div className="v-flex center" style={{width: '100%', alignItems: 'center'}}>
                    {readyToUpload ? (
                        <div className="uploading-section">
                            {uploadCompleted ? (
                                <div>
                                    <NavLink to="/dashboard">Completed</NavLink>
                                </div>
                            ) : (
                                <div>Uploading</div>
                            )}

                            <div className="progress-bar" style={{marginRight: '2em'}}>
                                <div style={{width: uploadedPercentage}} id="progress-bar-colored"/>
                            </div>
                        </div>
                    ) : (
                        <div onClick={() => checkPdf({
                            feesPnt: feesPercent,
                            discountAmnt,
                            invoiceItems,
                            clientInfo,
                            projectName: nameOfProject
                        })} className="button">
                            Create PDF
                        </div>


                    )}
                    <p style={{margin: 0, marginBottom: 10, textAlign: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 10}}> This invoice #
                        is: {linvoiceNumber === 0 ? '-' : linvoiceNumber + 1} </p>
                </div>
            </form>
        </div>
    );
};
export default CreateInvoice;
