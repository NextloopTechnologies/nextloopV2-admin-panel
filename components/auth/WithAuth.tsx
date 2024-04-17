"use client"

import { redirect } from 'next/navigation';
import { useContext, useLayoutEffect } from 'react';
import { AuthContextProps } from '@/types/auth';
import { AuthContext } from './AuthContext';
import { NextPage } from 'next';

const withAuth = <P extends {}> (WrappedComponent: NextPage<P>) => {
  return (props: P) => {
    const { authUser } = useContext<AuthContextProps>(AuthContext);
    useLayoutEffect(() => {
      if(!authUser) redirect("/")
    }, [authUser]);
  
    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
