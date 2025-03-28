
import React from 'react';
import { Helmet } from 'react-helmet';
import WorkerSearch from '../components/WorkerSearch';

const SearchPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Find Workers | Service Marketplace</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Find Workers</h1>
        <p className="text-muted-foreground mt-2">
          Search for skilled workers based on skills, location, and ratings
        </p>
      </div>
      
      <WorkerSearch />
    </div>
  );
};

export default SearchPage;
