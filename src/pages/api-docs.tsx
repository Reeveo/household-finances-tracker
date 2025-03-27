import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { NextPage } from 'next';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

const ApiDocs: NextPage = () => {
  useEffect(() => {
    // Set page title
    document.title = 'API Documentation - Personal Finance Tracker';
  }, []);

  return (
    <div className="api-docs">
      <SwaggerUI url="/api/swagger.json" />
      <style jsx global>{`
        .swagger-ui .topbar {
          display: none;
        }
        .api-docs {
          margin: 0;
          padding: 0;
        }
        .swagger-ui {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

// Mark this page as not requiring authentication
ApiDocs.auth = false;

export default ApiDocs; 