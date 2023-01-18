import { Box, Flex, Text, VStack, Input, Button } from '@chakra-ui/react'
import React, { MouseEvent, ChangeEvent, useState } from 'react'
import { IUserCreds } from '../interfaces/user.interface';
import { loginUser, registerUser, resetUserHelpers } from '../reducers/user.reducer/user.slice';
import { useAppDispatch, useAppSelector } from '../typed.hooks/hooks';

interface IUserCredsProps {
    first: boolean,
    customer: boolean
}

const UserCreds: React.FC<IUserCredsProps> = ({ first, customer }) => {

    const [creds, setCreds] = useState<IUserCreds>({
        email: "",
        password: "",
        phone: "",
        userType: customer ? "Customer" : "Owner"
    });

    const dispatch = useAppDispatch();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCreds(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        first ? await dispatch(registerUser(creds)) : await dispatch(loginUser(creds));
        dispatch(resetUserHelpers());
        setCreds(prevState => ({
            ...prevState,
            email: "",
            password: "",
            phone: "",
        }))
    };

    return (
        <>
            <Box
                w="50vh"
                h="50vh"
                borderRadius="1vh"
                borderWidth="1px"
                borderColor="gray.300"
            >
                <Flex
                    justify="center"
                    alignItems="center"
                    p="3vh"
                    borderBottom="1px"
                    borderBottomColor="gray.200"
                >
                    <Text>
                        {
                            first ? (customer ? "Register to book a jam room" : "Register to list your jam room") : (
                                customer ? "Login to have a good time!" : "Login to your owner account"
                            )
                        }
                    </Text>
                </Flex>
                <Flex
                    justify="center"
                    alignItems="center"
                    p="5vh"
                >
                    <VStack spacing="3vh">
                        {
                            first ? (
                                <>
                                    <Input placeholder="email" type="email" value={creds.email} name="email"
                                        onChange={handleChange}
                                    />
                                    <Input placeholder="phone" value={creds.phone} name="phone"
                                        onChange={handleChange}
                                    />
                                    <Input placeholder="password" type="password" name="password" value={creds.password}
                                        onChange={handleChange}
                                    />
                                </>
                            ) : (
                                <>
                                    <Input placeholder="email" type="email" value={creds.email} name="email"
                                        onChange={handleChange}
                                    />
                                    <Input placeholder="password" type="password" name="password" value={creds.password}
                                        onChange={handleChange}
                                    />
                                </>
                            )
                        }
                        <Button
                            onClick={handleClick}
                        >
                            {first ? "Register" : "Login"}
                        </Button>
                    </VStack>
                </Flex>
            </Box>
        </>
    )
}

export default UserCreds