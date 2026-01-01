import React from 'react';

const FloatingElements = ({ elements }) => {
  return (
    <div className="floating-elements">
      {elements.map((element, index) => (
        <div key={index} className="floating-element">{element}</div>
      ))}
    </div>
  );
};

export default FloatingElements;