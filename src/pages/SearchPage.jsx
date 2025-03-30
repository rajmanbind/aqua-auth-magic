
import React from 'react';
import { Helmet } from 'react-helmet';
import WorkerSearch from '../components/WorkerSearch';

const SearchPage = () => {
  return (
    <div className="container mx-auto py-4 px-4 md:py-8 md:px-4">
      <Helmet>
        <title>Find Workers | Service Marketplace</title>
      </Helmet>
      
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Find Workers</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Search for skilled workers based on location, skills, rating, and more
        </p>
      </div>
      
      <WorkerSearch />
    </div>
  );
};

export default SearchPage;
