import React, { FC, MutableRefObject, useRef } from 'react';
import {
    Box, Button, Flex, HStack, IconButton, Image, Text, useDisclosure,
    Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DrawerOverlay, DrawerCloseButton, VStack
} from "@chakra-ui/react";
import logo from "../assets/logo.jpeg"
import { ColorModeSwitcher } from '../ColorModeSwitcher';
import { useNavigate } from 'react-router-dom';
import { ISendUser } from '../interfaces/user.interface';
import { CgProfile } from "react-icons/cg";

interface INavbarProps {
    user: ISendUser | null
}

const Navbar: FC<INavbarProps> = ({ user }) => {

    const { onOpen, isOpen, onClose } = useDisclosure();
    const path = window.location.pathname;
    const navigate = useNavigate();
    const btnRef = useRef() as MutableRefObject<HTMLButtonElement>;;

    return (
        <>
            <Flex
                bg="orange.300"
            >
                <HStack spacing={!user ? (path === "/" ? "150vh" : "140vh") : (user?.userType === "Customer" ? "120vh" : "115vh")}>
                    <Image
                        src={logo}
                        alt="logo"
                        borderRadius="1.2vh"
                        width="4rem"
                        height="4rem"
                        ml="0.4rem"
                        mb="0.4rem"
                        mt="0.4rem"
                    />
                    {
                        !user ? (
                            <>
                                {
                                    path === "/" ? (
                                        <>
                                            <ColorModeSwitcher />
                                        </>
                                    ) : (
                                        <>
                                            <HStack>
                                                <Box>
                                                    <Button
                                                        onClick={() => {
                                                            const type = localStorage.getItem("type");
                                                            if (type === "customer") {
                                                                navigate("/register/customer")
                                                            } else {
                                                                navigate("/register/owner")
                                                            }
                                                        }}
                                                    >
                                                        Register
                                                    </Button>
                                                </Box>
                                                <Box>
                                                    <Button
                                                        onClick={() => {
                                                            const type = localStorage.getItem("type");
                                                            if (type === "customer") {
                                                                navigate("/login/customer")
                                                            } else {
                                                                navigate("/login/owner")
                                                            }
                                                        }}
                                                    >
                                                        Login
                                                    </Button>
                                                </Box>
                                                <ColorModeSwitcher />
                                            </HStack>
                                        </>
                                    )
                                }
                            </>
                        ) : (
                            <>
                                {
                                    user?.userType === "Customer" ? (
                                        <>
                                            <HStack spacing="3vh">
                                                <Text fontSize="2vh">
                                                    Welcome back, {user?.email}!
                                                </Text>
                                                <Button>
                                                    Logout
                                                </Button>
                                                <IconButton
                                                    aria-label='Menu'
                                                    icon={<CgProfile />}
                                                    onClick={onOpen}
                                                    bg="orange.300"
                                                    _hover={{ bg: "orange.300" }}
                                                    ref={btnRef}
                                                />
                                                <Drawer
                                                    isOpen={isOpen}
                                                    placement='right'
                                                    onClose={onClose}
                                                    finalFocusRef={btnRef}
                                                >
                                                    <DrawerOverlay />
                                                    <DrawerContent>
                                                        <DrawerCloseButton />
                                                        <DrawerHeader>Menu</DrawerHeader>
                                                        <DrawerBody>
                                                            <VStack>
                                                                <Text
                                                                    as="button"
                                                                >
                                                                    Profile
                                                                </Text>
                                                                <Text
                                                                    as="button"
                                                                >
                                                                    Orders
                                                                </Text>
                                                            </VStack>
                                                        </DrawerBody>
                                                        <DrawerFooter>
                                                            <Box>
                                                                <Button
                                                                    onClick={onClose}
                                                                >
                                                                    Close
                                                                </Button>
                                                            </Box>
                                                        </DrawerFooter>
                                                    </DrawerContent>
                                                </Drawer>
                                            </HStack>
                                        </>
                                    ) : (
                                        <>
                                            <HStack spacing="3vh">
                                                <Text>
                                                    Welcome back, {user?.email}!
                                                </Text>
                                                <Button>
                                                    Logout
                                                </Button>
                                            </HStack>
                                        </>
                                    )
                                }
                            </>
                        )
                    }
                </HStack>
            </Flex>
        </>
    )
}

export default Navbar