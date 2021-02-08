import React, { useState } from 'react'
import './ExpansionPanel.css'

const ExpansionPanel = ({ isOpen1, title, children }) => {

    let [isOpen, setOpen] = useState(isOpen1)

    return (


        <div className="expansion">

            <div className="expansion-header" onClick={() => setOpen(!isOpen)}>
                {
                    !isOpen
                        ?
                        <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24" /></g><g><g><path d="M19,3H5C3.89,3,3,3.9,3,5v14c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M16,13h-3v3c0,0.55-0.45,1-1,1 l0,0c-0.55,0-1-0.45-1-1v-3H8c-0.55,0-1-0.45-1-1l0,0c0-0.55,0.45-1,1-1h3V8c0-0.55,0.45-1,1-1l0,0c0.55,0,1,0.45,1,1v3h3 c0.55,0,1,0.45,1,1l0,0C17,12.55,16.55,13,16,13z" /></g></g></svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 11h10v2H7z" /></svg>
                }
                <p className="title">{title}</p>
            </div>



            <div className={ `expansion-body ${isOpen ? `active` : ''}`} >

                {children}

            </div>


        </div>



    )
}

export default ExpansionPanel;