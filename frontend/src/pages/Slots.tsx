import React, { FC, useEffect, useLayoutEffect, useState, useRef, MutableRefObject } from 'react';
import { useLocation } from 'react-router-dom';
import { getSlotsByDateUser, resetPadHelpers } from '../reducers/pads.reducer/pads.slice';
import { useAppDispatch, useAppSelector } from '../typed.hooks/hooks';
import { Box, Flex, Grid, Spinner, Button } from "@chakra-ui/react";

const Slots: FC = () => {
    console.log("rendered")
    const { state } = useLocation();
    const dispatch = useAppDispatch();
    const { slots } = useAppSelector(state => state.pads);

    useEffect(() => {
        console.log("first");
        (async () => {
            await dispatch(getSlotsByDateUser(state));
            dispatch(resetPadHelpers());
        })()
    }, [dispatch])

    const [idArray, setIdArray] = useState<any>([])

    return (
        <>
            <Flex
                justify="center"
                alignItems="center"
                p="10vh"
            >
                {
                    !slots ? (
                        <>
                            <Spinner
                                speed="0.65s"
                                color="blue.500"
                                emptyColor='gray.300'
                                size="xl"
                                thickness="4px"
                            />
                        </>
                    ) : (
                        <>
                            <Box
                                w="140vh"
                                h="70vh"
                                borderRadius="1vh"
                                borderWidth="1px"
                                borderColor="gray.300"
                                position="relative"
                            >
                                <Grid templateColumns='repeat(6, 1fr)' gap={6} p="3vh">
                                    {
                                        slots?.map((el, idx) => (
                                            <Button key={idx}
                                                disabled={idArray.includes(el) ? true : false}
                                                onClick={() => { setIdArray((prevState: any) => [...prevState, el]) }}
                                            >
                                                {el}
                                            </Button>
                                        ))
                                    }
                                </Grid>
                                <Flex
                                    bottom="0"
                                    h="7vh"
                                    justify="center"
                                    position="absolute"
                                >
                                    <Button
                                        ml="120vh"
                                        bg="blue.500"
                                        color="white"
                                    >
                                        Book Slots
                                    </Button>
                                </Flex>
                            </Box>
                        </>
                    )
                }
            </Flex>
        </>
    )
}

export default Slots