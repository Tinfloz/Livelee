import React from 'react';
import { Box, HStack, Text, Image, VStack, Button } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.jpeg"

const Landing = () => {

    const navigate = useNavigate();

    return (
        <>
            <HStack>
                <Box
                    h="90vh"
                    w="50%"
                >
                    <Image
                        src={logo}
                        alt="logo"
                        height="90vh"
                    />

                </Box>
                <Box
                    h="90vh"
                    w="50%"
                    display="grid"
                    placeContent="center"
                >
                    <VStack spacing="5vh">
                        <Box
                            display="grid"
                            placeContent="center"
                            borderWidth="1px"
                            borderColor="gray.300"
                            borderStyle="dashed"
                            w="50vh"
                            h="35vh"
                        >
                            <VStack>
                                <Text>
                                    Register as a musician!
                                </Text>
                                <Button
                                    onClick={() => {
                                        localStorage.setItem("type", "customer");
                                        navigate("/register/customer")
                                    }}
                                >
                                    Go
                                </Button>
                            </VStack>
                        </Box>
                        <Box
                            display="grid"
                            placeContent="center"
                            borderWidth="1px"
                            borderColor="gray.300"
                            borderStyle="dashed"
                            w="50vh"
                            h="35vh"
                        >
                            <VStack>
                                <Text>
                                    Register as a jam room owner!
                                </Text>
                                <Button
                                    onClick={() => {
                                        localStorage.setItem("type", "owner");
                                        navigate("/register/owner")
                                    }}
                                >
                                    Go
                                </Button>
                            </VStack>
                        </Box>
                    </VStack>
                </Box>
            </HStack >
        </>
    )
}

export default Landing