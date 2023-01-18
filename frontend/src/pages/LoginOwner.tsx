import React from 'react';
import { Flex } from "@chakra-ui/react";
import UserCreds from '../components/UserCreds';

const LoginOwner = () => {
    return (
        <>
            <Flex
                justify="center"
                alignItems="center"
                p="15vh"
            >
                <UserCreds first={false} customer={false} />
            </Flex>
        </>
    )
}

export default LoginOwner