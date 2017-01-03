#!/bin/bash
NORMAL=$(tput sgr0)
GREEN=$(tput setaf 2; tput bold)
YELLOW=$(tput setaf 3)
RED=$(tput setaf 1)

# IMPORTANT
OUTPUT=$1
BASEPATH=$2
CUSTOMER=$3

#phoenix
folderCreate() {
    removeTempFolder
    mkdir $BASEPATH/temp
    mkdir $BASEPATH/temp/phoenix
}

copyLocale() {
    cp -r $BASEPATH/locale $BASEPATH/temp
}

removeTempFolder() {
    # Cleaning Up
    if [ -d $BASEPATH/temp ]; then
        rm -r $BASEPATH/temp
    fi
}

removeTempPhoenixFolder() {
    # Cleaning Up
    if [ -d $BASEPATH/temp/phoenix ]; then
        rm -r $BASEPATH/temp/phoenix
    fi
}

fileMove() {
    for entry in "$BASEPATH/temp/phoenix"/*
    do
      if [ -f "$entry" ]; then
        FILE=`basename "$entry"`
        NAME="${FILE%.*}"
        if [ -d $BASEPATH/temp/locale/$NAME ]; then
            mv $entry $BASEPATH/temp/locale/$NAME/phoenix-$FILE
        fi
      fi
    done
}

mergePhoenix() {    
    node phoenix/buildLocale.js $BASEPATH/phoenix/locale $BASEPATH/temp/phoenix
}

merge() {
    node buildLocale.js $BASEPATH/temp/locale $OUTPUT/locale $CUSTOMER
}


chooseCustomer() {
    echo "${RED} \nSPARROW BUILD SCRIPT"
    echo "${RED}----------------------${BOLD}"
    echo "${YELLOW}1) Elsevier"
    echo "${YELLOW}2) RSC ${NORMAL}"
    echo "${YELLOW}3) RAS ${NORMAL}"
    echo "${YELLOW}4) SJS ${NORMAL}"
    echo "${RED}----------------------"
    echo "${GREEN}Please choose customer: ${NORMAL}"
    read input_variable
    if [ "$input_variable" = "1" ]
    then
       echo "Build Starts for customer Elsevier"
       CUSTOMER="elsevier"
    elif [ "$input_variable" = "2" ]
    then
        echo "Build Starts for customer RSC"
        CUSTOMER="rsc"
    elif [ "$input_variable" = "3" ]
    then
        echo "Build Starts for customer RAS"
        CUSTOMER="ras"
    elif [ "$input_variable" = "4" ]
    then
        echo "Build Starts for customer SJS"
        CUSTOMER="sjs"    
    else
       echo "Error"
       exit
    fi
}

if [ -z "$OUTPUT" ]; then
    OUTPUT=$PWD
fi
if [ -z "$BASEPATH" ]; then
    BASEPATH=$PWD
fi
if [ -z "$CUSTOMER" ]; then
    chooseCustomer
fi

echo "${GREEN}Locale Initializing${NORMAL}"
folderCreate
echo "${YELLOW} Temp folders created ${NORMAL}"
copyLocale
echo "${YELLOW} Locale copied ${NORMAL}"
mergePhoenix
echo "${YELLOW} phoenix merged ${NORMAL}"
fileMove
echo "${YELLOW} Files moved successfully ${NORMAL}"
removeTempPhoenixFolder
merge
echo "${YELLOW} Locale created ${NORMAL}"
removeTempFolder
echo "${YELLOW} Temp folder removed ${NORMAL}"
echo "${GREEN} END${NORMAL}"
