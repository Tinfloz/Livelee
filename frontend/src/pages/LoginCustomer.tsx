import React from 'react';
import { Flex } from "@chakra-ui/react";
import UserCreds from '../components/UserCreds';

const LoginCustomer = () => {
    return (
        <>
            <Flex
                justify="center"
                alignItems="center"
                p="15vh"
            >
                <UserCreds first={false} customer={true} />
            </Flex>
        </>
    )
}

export default LoginCustomer