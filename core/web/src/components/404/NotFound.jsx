import React from 'react';

const NotFound = ({ extraStyles }) => (
  <div
    className="NotFound"
    style={{
      height: '100dvh',
      backgroundImage: 'url(/static/404.svg)',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      ...extraStyles,
    }}
  />
);

export default NotFound;
