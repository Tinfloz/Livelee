import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPadsByIdLoginUser, resetPadHelpers } from '../reducers/pads.reducer/pads.slice';
import { useAppDispatch, useAppSelector } from '../typed.hooks/hooks';
import moment from "moment";
import {
    Flex, Card, CardBody, CardHeader, CardFooter, Text, Stack, Image,
    Button, ButtonGroup, Heading, Divider, Spinner, Select, HStack
} from '@chakra-ui/react';
import { IPads } from '../interfaces/pad.interface';
import { useNavigate } from 'react-router-dom';

const IndividualJamPad = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { pads } = useAppSelector(state => state.pads);
    const [date, setDate] = useState<{ date: string }>({
        date: moment(new Date(), "DD/MM/YYYY").format("DD/MM/YYYY")
    });

    useEffect(() => {
        (async () => {
            await dispatch(getPadsByIdLoginUser(id!));
            dispatch(resetPadHelpers());
        })()
    }, [])

    const instanceOfIPads = (param: any): param is IPads => {
        return param.address !== undefined;
    };

    const datesArray = useMemo((): Array<string> => {
        let start = moment(new Date(), "DD/MM/YYYY");
        let end = moment(start.clone(), "DD/MM/YYYY").add(15, "days");
        let datesArray = [];
        while (start) {
            datesArray.push(start.format("DD/MM/YYYY"));
            if (start.format("DD/MM/YYYY") === end.format("DD/MM/YYYY")) {
                break;
            };
            start.add(1, "day");
        };
        return datesArray;
    }, [])

    return (
        <>
            <Flex
                justify="center"
                alignItems="center"
                p="15vh"
            >
                {
                    !pads ? (
                        <>
                            <Spinner
                                speed='0.65s'
                                color='blue.500'
                                emptyColor='gray.300'
                                size="xl"
                                thickness='4px'
                            />
                        </>
                    ) : (
                        <>
                            {
                                instanceOfIPads(pads) ? (
                                    <>
                                        <Card maxW='sm'>
                                            <CardBody>
                                                <Image
                                                    src={pads?.image}
                                                    alt={pads?._id}
                                                    borderRadius='lg'
                                                />
                                                <Stack mt='6' spacing='3'>
                                                    <Heading size='md'>{pads?.name}</Heading>
                                                    <Text>
                                                        {pads?.equipemnt}
                                                    </Text>
                                                    <Text color='blue.600' fontSize='2xl'>
                                                        {`${pads?.rate} per slot`}
                                                    </Text>
                                                </Stack>
                                            </CardBody>
                                            <CardFooter>
                                                <HStack>
                                                    <Select
                                                        value={date.date}
                                                        onChange={(e) => {
                                                            setDate(prevState => ({
                                                                ...prevState,
                                                                date: e.target.value
                                                            }));
                                                        }}
                                                    >
                                                        {
                                                            datesArray?.map(el => (
                                                                <option value={el}>
                                                                    {el}
                                                                </option>
                                                            ))
                                                        }
                                                    </Select>
                                                    <Button w="25vh"
                                                        onClick={() => {
                                                            navigate("/slots", {
                                                                state: {
                                                                    id,
                                                                    date
                                                                }
                                                            })
                                                        }}
                                                    >
                                                        {date.date}
                                                    </Button>
                                                </HStack>
                                            </CardFooter>
                                        </Card>
                                    </>
                                ) : (
                                    <>
                                        <Text
                                            as="b"
                                            fontSize="4vh"
                                            color="gray.400"
                                        >
                                            There has been an error in loading this page!
                                        </Text>
                                    </>
                                )
                            }
                        </>
                    )
                }
            </Flex>
        </>
    )
}

export default IndividualJamPad