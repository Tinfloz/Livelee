import React from 'react';
import { Flex } from "@chakra-ui/react";
import UserCreds from '../components/UserCreds';

const RegisterCustomer = () => {
    return (
        <>
            <Flex
                justify="center"
                alignItems="center"
                p="15vh"
            >
                <UserCreds first={true} customer={true} />
            </Flex>
        </>
    )
}

export default RegisterCustomer