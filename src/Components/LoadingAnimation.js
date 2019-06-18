import React from 'react';
import '../Assets/styles/loadingAnimation.css'
const LoadingAnimation = () => {
	return (
		<div style={{display:'flex',justifyContent:'center',padding:'1em 0em'}}>
			<div className="lds-roller">
				<div />
				<div />
				<div />
				<div />
				<div />
				<div />
				<div />
				<div />
			</div>

		</div>
	);
};

export default LoadingAnimation;
