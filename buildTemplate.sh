#!/bin/
set -e

NORMAL=$(tput sgr0)
GREEN=$(tput setaf 2; tput bold)
YELLOW=$(tput setaf 3)
RED=$(tput setaf 1)
VERSION=$(($(date +'%s * 1000 + %-N / 1000000')))
ENG="en-US"

# IMPORTANT
CUSTOMER=$1
TAGID=$2
OUTPUT=$3
BASEPATH=$4

checkFolder() {
    if [ ! -d "$OUTPUT" ]; then
        mkdir $OUTPUT -p
    fi
    if [ ! -d "$OUTPUT"/config ]; then
        mkdir $OUTPUT/config
    fi
}

replace() {
    sed -i -e "s/##VERSION##/$2/g"  $1
    sed -i -e "s/##LOCALE##/$3/g"  $1
    sed -i -e "s/##CUSTOMER##/$CUSTOMER/g"  $1
    sed -i -e "s/##TAGID##/$TAGID/g"  $1
}

buildTemplate() {
    LANDINGTEMPLATENAME="landing-page.html"
    HELPTEMPLATENAME="help.html"
    OFFLINETEMPLATENAME="offline.html"
    for file in $BASEPATH/locale/*
    do
      if [ -f "$file" ]; then
        echo "$file"
        FILE=`basename "$file"`
        LOCALE="${FILE%.*}"
        LANG="${LOCALE%-*}"
        if [ ! -d "$OUTPUT/$LANG" ]; then
            mkdir $OUTPUT/$LANG
        fi
        cp landing-page.tmpl $OUTPUT/$LANG/$LANDINGTEMPLATENAME
        replace $OUTPUT/$LANG/$LANDINGTEMPLATENAME $VERSION $LOCALE

        echo "${YELLOW} => Landing page Template created for $LOCALE";

        cp offline.tmpl $OUTPUT/$LANG/$OFFLINETEMPLATENAME
        replace $OUTPUT/$LANG/$OFFLINETEMPLATENAME $VERSION $LOCALE

        echo "${YELLOW} => Offline page Template created for $LOCALE";

        cp help.tmpl $OUTPUT/$LANG/$HELPTEMPLATENAME
        replace $OUTPUT/$LANG/$HELPTEMPLATENAME $VERSION $LOCALE

        echo "${YELLOW} => Help Template created for $LOCALE";

        cp scripts/config/Configuration.js.liquid $OUTPUT/$LANG/Configuration.js
        replace $OUTPUT/$LANG/Configuration.js $VERSION $LOCALE

        echo "${YELLOW} => Configuration created for $LOCALE";
      fi
    done
}


if [ -z "$OUTPUT" ]; then
    OUTPUT=$PWD
fi
if [ -z "$BASEPATH" ]; then
    BASEPATH=$PWD
fi


echo "${GREEN}Template Generation Starts${NORMAL}"
checkFolder
echo "${YELLOW} check folders ${NORMAL}"
echo "${YELLOW} Building Templates ${NORMAL}"
buildTemplate
echo "${GREEN} END${NORMAL}"
