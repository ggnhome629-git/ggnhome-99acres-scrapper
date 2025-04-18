import React from "react";
import {
  Box,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { LANGUAGE_VERSIONS } from "../constants";

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "blue.400";

const LanguageSelector = ({ language, onSelect }) => {
  return (
    <Box ml={2} mb={4}>
      <Text mb={2} fontSize="lg" color="white">
        Language:
      </Text>
      <Menu isLazy>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
          {language}
        </MenuButton>
        <MenuList bg="#110c1b">
          {languages.map(([lang, version]) => (
            <MenuItem
              key={lang}
              color={lang === language ? ACTIVE_COLOR : "white"}
              bg={lang === language ? "gray.900" : "transparent"}
              _hover={{
                color: ACTIVE_COLOR,
                bg: "gray.800",
              }}
              onClick={() => onSelect(lang)}
            >
              <Box display="flex" justifyContent="space-between" width="100%">
                <span>{lang}</span>
                <Text as="span" fontSize="sm" color="gray.500">
                  ({version})
                </Text>
              </Box>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default LanguageSelector;