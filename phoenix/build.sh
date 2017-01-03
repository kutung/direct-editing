#!/bin/bash
NORMAL=$(tput sgr0)
GREEN=$(tput setaf 2; tput bold)
YELLOW=$(tput setaf 3)
RED=$(tput setaf 1)

# IMPORTANT
OUTPUT=$1
BASEPATH=$2

folderCreate()
{
    # Cleaning Up
    if [ -d "$OUTPUT" ]; then
        echo "${RED} '$OUTPUT' folder in '$BASEPATH' already exist! \n Remove it manually before continue ${NORMAL}";
        exit
        # rm -r $OUTPUT
    fi
    if [ ! -z "$OUTPUT" ]; then
        mkdir -p $OUTPUT
    fi
}

buildJs()
{
    mkdir $OUTPUT/scripts
    mkdir $OUTPUT/locale
    node $BASEPATH/buildLocale.js $BASEPATH/locale $OUTPUT/locale
    r.js -o $BASEPATH/build.js dir=$OUTPUT/scripts/
}

buildCss()
{
    mkdir -p $OUTPUT/styles
    r.js -o cssIn=$BASEPATH/build.css out=$OUTPUT/styles/pcui.css
}

buildCommon()
{
    cp -fr $BASEPATH/images $OUTPUT
}

if [ -z "$OUTPUT" ]; then
    OUTPUT=$PWD
fi
if [ -z "$BASEPATH" ]; then
    BASEPATH=$PWD
fi


echo "${YELLOW}a) Initializing${NORMAL}"
folderCreate

echo "${YELLOW}b) Building and Copying neccessary files/folders...${NORMAL}"
buildJs
buildCss
buildCommon

echo "${GREEN}Phoenix Build Completed!!!${NORMAL}"


