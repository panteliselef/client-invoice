import React, {useEffect, useState, useCallback, useContext} from 'react';
import { NavLink, withRouter } from 'react-router-dom';

// Utils
import { bytesToSize, categoryOptions } from '../Utils/utils';

// Components
import Header from '../Components/Header';
import LoadingAnimation from '../Components/LoadingAnimation';

// Firebase
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

// CSS
import '../Assets/styles/dashboard.css';
import {actions} from "../Actions/mainActions";
import {AppContext} from "../App";


const Dashboard = () => {

  const {dispatch, state} = useContext(AppContext);
  const [isFetchingData, setIsFetchingData] = useState(false); // hook: for displaying loading spinner while fetching data
  const [files, setFiles] = useState([]); // hook: array of user's files
  const [filteredfiles, setFilteredFiles] = useState([]); // hook: array of user's files
  const user = firebase.auth().currentUser; // ref: firebase.user


  const [isDesktop, setDesktop] = useState(window.innerWidth > 800);

  // const [activeCategory, setActiveCategory] = useState(categoryOptions[0])

  const updateMedia = () => {
    setDesktop(window.innerWidth > 800);
  };


  useEffect(() => {
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });


  async function fetchPdfFromStorage(name) {
    let pdfRef = firebase.storage().ref(`/${user.uid}/invoices/${name}`);

    return new Promise(async (resolve, reject) => {
      try {
        const url = await pdfRef.getDownloadURL();
        resolve(url)
      } catch (error) {
        switch (error.code) {
          case 'storage/object-not-found':
            // File doesn't exist
            break;

          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;

          case 'storage/canceled':
            // User canceled the upload
            break;
          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
          default:
          // do nothing
        }
        reject(error.code)
      }
    })
  }

  const d = useCallback(fetchPdfFromStorage, [user])

  useEffect(
    () => {
      const database = firebase.database(); // ref: firebase.database
      const firebaseFiles = database.ref(`/files/${(state) ?
          state.signedInUserInfo.uid : ""}/invoices`); // ref: firebase database files path

      setIsFetchingData(true);
      firebaseFiles.on('value', async (snapshot) => {
        console.log('snap', snapshot.val())
        const fileObj = snapshot.val();
        if (fileObj) {
          const fileList = await Promise.all(Object.keys(fileObj).map(async (key) => {
            const data = fileObj[key].metadata;
            const url = await d(data.name) //fetchPdfFromStorage(data.name)
            return {
              url,
              data,
              id: key
            }
          }));


          setFiles(fileList);
          setIsFetchingData(false);
        } else {
          setFiles([]);
          setIsFetchingData(false);
        }

        // dispatch({type: actions.UPDATED_CATEGORY, payload: categoryOptions[0]})
      });

      return function cleanup() {
        firebaseFiles.off();
        setIsFetchingData(false);
      };
    },
    [state, d, dispatch]
  );

  useEffect(() => {
    console.log(state.activeCategory, files)
    let ff = [];
    if (state.activeCategory === 'Serbian') {
      ff = files.filter(file => file.data.invoiceCatergory === state.activeCategory)
    } else {
      ff = files.filter(file => file.data.invoiceCatergory === state.activeCategory || file.data?.invoiceCatergory == null)
    }

    setFilteredFiles(ff);
  }, [state.activeCategory, files])


  return (
    <div className="container">
      <Header />
      <div className="dashboard">
        <div className="page-title"> Dashboard</div>
        <div className="page-subtitle"> Welcome, {user?.displayName} 🔥</div>
        <div className="h-flex space-between">
          <div>
            <NavLink to="/create-invoice">
              <div className="btn-rounded dark" style={{ marginLeft: 0, minWidth: '140px' }}>New Invoice</div>
            </NavLink>
            <select value={state.activeCategory} onChange={(e) => {
              // setActiveCategory(e.target.value)
              dispatch({type: actions.UPDATED_CATEGORY, payload: e.target.value})
            }}>
              {categoryOptions.map((option, index) =>
                <option key={index} value={option}>{option}</option>
              )}
            </select>
          </div>

          <NavLink to="/create-client">
              <div className="btn-rounded" style={{ marginLeft: 0, minWidth: '140px' }}>Manage Clients</div>
          </NavLink>

        </div>





        <div className="files-table">
          {isDesktop ?
            (<div className="entry-first">
              <div>name Of file</div>
              <div>Date updated</div>
              <div>Size</div>
            </div>) :
            <div className="entry-first">
              <div>name Of file</div>
              <div>Date updated</div>
            </div>
          }
          {isFetchingData ? (
            <LoadingAnimation />
          ) : filteredfiles.length === 0 ? (
            <div style={{ textAlign: "center", margin: "2em" }}>No files uploaded yet</div>
          ) : (
            filteredfiles
              .sort((a, b) => b.data.customMetadata.timestamp - a.data.customMetadata.timestamp)
              .map(({ id, data, url }) => {
                let updatedData = new Date(data.updated);
                return isDesktop ?
                  <div key={id} className="entry">
                    <div>{data.name}</div>
                    <div>{updatedData.toLocaleString()}</div>
                    <div className="number">{bytesToSize(data.size)}</div>
                    <a className="link" href={url} rel="noreferrer" target={'_blank'}>Open</a>
                  </div>
                  :
                  <a key={id} href={url} target={'_blank'} rel="noreferrer" className="entry">
                    <div>{data.name}</div>
                    <div>{updatedData.toLocaleDateString()}</div>
                  </a>
                  ;
              })
          )}
        </div>
      </div>
    </div>
  );
};
export default withRouter(Dashboard);
