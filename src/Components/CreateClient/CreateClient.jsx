import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/auth';
import 'firebase/database';

// Components
import { NavLink } from 'react-router-dom';
import Header from '../Header';

// CSS
import '../../Assets/styles/invoice-form.css';

// Images
import arrowBox from '../../Assets/arrow-left-box.svg';

const CreateClient = (props) => {
  const { uid } = props;


  const database = firebase.database();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('Select Client');

  const [formIsDirty, setFormDirty] = useState(false);

  const [formError, setFormError] = useState(undefined);
  const [formSuccess, setFormSuccess] = useState(undefined);

  const emptyClientInfo = {
    name: '',
    address: '',
    phone: '',
    email: '',
    place_issued: '',
    c_pib: '',
    c_mb: ''
  }

  const [clientInfo, setClientInfo] = useState(emptyClientInfo);

  const [wantsToUpdateClient, setWantsToUpdateClient] = useState(false);

  useEffect(() => {
    const firebaseClients = database.ref(`/clients/${props.uid}/`);
    const fetchAllClients = () => {
      let clients = []
      firebaseClients.once('value', (snapshot) => {
        snapshot.forEach((child) => {
          console.log(child.key)
          clients.push({ key: child.key, val: child.val() });
        });
        setClients(clients);
      });
    };
    fetchAllClients()
  }, [props, database]);


  const addClientInfo = () => {
    if (clientInfo.name.trim() === '') {
      setFormError('Field "Name" is empty')
      return;
    }
    if (!formIsDirty) return
    database.ref(`/clients/${uid}`)
      .push(clientInfo)
      .then(() => {
        setFormSuccess('Added Client Info')
        setClientInfo(emptyClientInfo)
      })
    setFormDirty(false)
  }

  const resetClientSelection = (e) => {
    e.preventDefault();
    setWantsToUpdateClient(false);
    setClientInfo(emptyClientInfo)
    setSelectedClient("Select Client")
  }

  const fillClientInfoOfClient = (e) => {
    const clientKey = e.target.value;
    setSelectedClient(clientKey)
    const clientFound = clients.find(client => client.key === clientKey);
    if (!clientFound) return
    setClientInfo(clientFound.val)
    setWantsToUpdateClient(true)
  }

  useEffect(() => {
    
    setFormError(undefined)
    setFormSuccess(undefined)

  },[formIsDirty])

  const updateClientInfo = (e) => {
    if (clientInfo.name.trim() === '') {
      setFormError('Field "Name" is empty')
      return;
    }
    if (!formIsDirty) return
    database.ref(`/clients/${uid}/${selectedClient}`)
      .update(clientInfo)
      .then(() => {
        setFormSuccess('Updated Client Info')
      })
    setFormDirty(false)
  }

  const onInputChange = (itemToUpdate) => {
    setClientInfo({ ...clientInfo, ...itemToUpdate })
    setFormDirty(true);
  }

  return (
    <div className="container"
      style={{ width: '100%' }}
    >
      <Header />
      <form name="invoice-form" className="invoice-form">
        <div className="h-flex align-center" style={{ flexWrap: 'wrap' }}>
          <NavLink to="/dashboard">
            <img src={arrowBox} width="30" height="30" alt='go-back-arrow' />
          </NavLink>
          <div className="page-title" style={{ marginLeft: '.5rem' }}>
            Manage Clients
          </div>
        </div>
        <div className="h-flex" style={{ gap: '10px' }}>
          <select style={{ padding: '.5rem' }} disabled={clients.length === 0} value={selectedClient} onChange={fillClientInfoOfClient}>
            <option value="Select Client" disabled={true}>Select Client</option>
            {clients.map(({ key, val }) =>
              <option key={key} value={key}>{val.name}</option>
            )}
          </select>
          {wantsToUpdateClient && <button onClick={resetClientSelection}>Cancel Selection</button>}

        </div>
        <div className="client-info-inputs">
          <div className="inputs">
            <input
              onChange={(e) => onInputChange({ name: e.target.value })}
              value={clientInfo.name}
              placeholder="Name"
            />
            <input
              onChange={(e) => onInputChange({ email: e.target.value })}
              value={clientInfo.email}
              placeholder="Email"
              type="email"
            />
            <input
              onChange={(e) => onInputChange({ address: e.target.value })}
              value={clientInfo.address}
              placeholder="Address"
            />
            <input
              onChange={(e) => onInputChange({ phone: e.target.value })}
              value={clientInfo.phone}
              placeholder="Phone"
              type="tel"
            />
          </div>


          <h2>Serbian Info</h2>
          <div className="inputs">

            <input
              onChange={(e) => onInputChange({ place_issued: e.target.value })}
              value={clientInfo.place_issued}
              placeholder="Place Issued"
              type="text"
            />

            <input
              onChange={(e) => onInputChange({ c_pib: e.target.value })}
              value={clientInfo.c_pib}
              placeholder="Client PIB"
              type="text"
            />

            <input
              onChange={(e) => onInputChange({ c_mb: e.target.value })}
              value={clientInfo.c_mb}
              placeholder="Client MB"
              type="text"
            />
          </div>

          <div className="v-flex center align-center">
            {wantsToUpdateClient ?
              <div className="btn-rounded dark" style={{ minWidth: '140px' }} onClick={() => updateClientInfo()}>{formSuccess ? 'Updated' : 'Update'}</div>
              :
              <div className="btn-rounded dark" style={{ minWidth: '140px' }} onClick={() => addClientInfo()}>{formSuccess ? 'Added' : 'Add'}</div>}

            {formError &&
              <label style={{ marginLeft: '1rem' }} className={'error'}>{formError}</label>
            }
            {formSuccess && <label style={{ marginLeft: '1rem' }} className={'success'}>{formSuccess}</label>}
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateClient