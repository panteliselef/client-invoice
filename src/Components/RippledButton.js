import React, {useState}from 'react';
import '../Assets/styles/rippled.css'
const RippledButton= (props)=> {
  const [circles,setCircles] = useState([]);
  const createRipple=(e)=> {
    e.preventDefault();
    // e.persist();
    console.log("ClientY",e.clientY)
    // console.log("Pos",e.clientX,e.clientY);
    console.log("Top",e.target.offsetTop);
    let d = Math.max(e.target.offsetWidth,e.target.offsetHeight);
    console.log("ClientY-Top",Math.abs(e.clientY-e.target.offsetTop))
    let circle = {
      key: Date.now(),
      size: d,
      left: e.clientX-e.target.offsetLeft- (d/2),
      top: Math.abs(e.clientY-e.target.offsetTop) - (d/2)
    }
    setCircles([...circles,circle]);
  }

  const actionWithRipple = (e) => {
    createRipple(e);
    props.onClick(e);
  }

  console.log(props); 

  return(
    <button onMouseLeave={()=>setTimeout(()=>setCircles([]),500)} onClick={(e)=>actionWithRipple(e)} className={`rippled ${props.className}`}>
      {props.children}
      {circles.map(({size,left,top,key})=>{
        return(
          <div key={key} className="circle" style={{width:size,height:size,left:left,top:top,backgroundColor:props.color}}></div>
        )
      })}
    </button>
  )
}
export default RippledButton;