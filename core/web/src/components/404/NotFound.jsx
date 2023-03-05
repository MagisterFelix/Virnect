import React from 'react';

import './NotFound.scss';

const NotFound = () => (
  <div
    className="NotFound"
    style={{
      backgroundImage: 'url(/static/404.svg)',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  />
);

export default NotFound;
