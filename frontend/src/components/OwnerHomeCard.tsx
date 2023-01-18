import React, { FC } from 'react';
import { Card, CardHeader, Heading, CardBody, Text, CardFooter, Button } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';

interface IOwnerHomeCardProps {
    heading: string,
    text: string,
    nav: string
}

const OwnerHomeCard: FC<IOwnerHomeCardProps> = ({ heading, text, nav }) => {

    const navigate = useNavigate();

    return (
        <>
            <Card align='center'>
                <CardHeader>
                    <Heading size='md'>{heading}</Heading>
                </CardHeader>
                <CardBody>
                    <Text>{text}</Text>
                </CardBody>
                <CardFooter>
                    <Button colorScheme='blue'
                        onClick={() => navigate(nav)}
                    >
                        Go
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}

export default OwnerHomeCard