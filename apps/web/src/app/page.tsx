"use client";

import { Button, Flex, Heading, Text } from "@radix-ui/themes";

export default function HomePage() {
    return (
        <div className="m-auto">
            <Flex direction="column" gap="2" justify="center">
                <Text>Hello from Radix Themes :)</Text>
                <Button>Let's go</Button>
            </Flex>
        </div>
    );
}
