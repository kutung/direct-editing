#!/bin/bash
set -e

VERSION=$(($(date +'%s * 1000 + %-N / 1000000')))

NORMAL=$(tput sgr0)
BOLD=$(tput bold)
GREEN=$(tput setaf 2; tput bold)
YELLOW=$(tput setaf 3)
RED=$(tput setaf 1)
DEFAULTLANG="en-US"
CUSTOMER="elsevier"
TAGID="NONE"

folderCreate()
{
    # Cleaning Up
    if [ -d "dist" ]; then
        rm -r dist/
    fi
    mkdir dist
    mkdir dist/config -p
    mkdir dist/locale -p
}

createTempAndBuildJs() {
    cp $1 temp-$1
    sed -i -e "s/##CUSTOMER##/$CUSTOMER/g"  temp-$1
    r.js -o temp-$1
    rm temp-$1
}

createTempAndBuildCss() {
    cp $1 temp-$1
    sed -i -e "s/##CUSTOMER##/$CUSTOMER/g"  temp-$1
    r.js -o cssIn=temp-$1 out=$2
    rm temp-$1
}

buildJs()
{
    createTempAndBuildJs build.js
    createTempAndBuildJs buildHelp.js
    createTempAndBuildJs buildLandingPage.js
    createTempAndBuildJs buildSessionPage.js
    createTempAndBuildJs buildOfflinePage.js
    cp scripts/libs -R dist/libs
    cp scripts/rte-plugin -R dist/rte-plugin
}

buildCss()
{
    createTempAndBuildCss build.css dist/pcui.css
    createTempAndBuildCss buildHelp.css dist/pchelp.css
    createTempAndBuildCss buildLandingPage.css dist/pclandingpage.css
    createTempAndBuildCss buildOfflinePage.css dist/pcofflinepage.css
    createTempAndBuildCss buildSessionPage.css dist/pcsessionpage.css
}

copyXML() {
    cp xml-editor -R dist/xml-editor
}

buildManualSubmit() {
    cp featuretoggler -R dist/featuretoggler
    # Configuration Files
    sed -i -e "s/##VERSION##/$VERSION/g"  dist/featuretoggler/index.html
}

buildFeatureToggle() {
    cp manualSubmit -R dist/manualSubmit
    # Configuration Files
    sed -i -e "s/##VERSION##/$VERSION/g"  dist/manualSubmit/index.html
    mv dist/manualSubmit/scripts/config.js.liquid dist/manualSubmit/scripts/config.js
}

buildCommon()
{
    cp -fr images dist
    cp fonts -R dist/fonts
    cp robots.txt dist/
    cp index.tmpl dist/index.html
    sed -i -e "s/##VERSION##/$VERSION/g"  dist/index.html
    sed -i -e "s/##LOCALE##/$DEFAULTLANG/g"  dist/index.html
    sed -i -e "s/##CUSTOMER##/$CUSTOMER/g"  dist/index.html
    cp session-landingpage.tmpl dist/session-landingpage.html
    sed -i -e "s/##VERSION##/$VERSION/g"  dist/session-landingpage.html
    sed -i -e "s/##LOCALE##/$DEFAULTLANG/g"  dist/session-landingpage.html
    sed -i -e "s/##CUSTOMER##/$CUSTOMER/g"  dist/session-landingpage.html
    cp styles/ckeditor.css dist/

    # Configuration Files
    cp scripts/config/Configuration.js.liquid dist/config/Configuration.js
    sed -i -e "s/##LOCALE##/$DEFAULTLANG/g"  dist/config/Configuration.js
    sed -i -e "s/##TAGID##/$TAGID/g"  dist/config/Configuration.js
    cp scripts/config/interface.json.liquid dist/config/interface.json
    cp scripts/config/routes.json.liquid dist/config/routes.json
}

buildPaginate()
{
    createTempAndBuildJs buildValidate.js
    createTempAndBuildCss buildValidate.css dist/pcValidate.css
    cp validate.tmpl dist/validate.html
    sed -i -e "s/##CUSTOMER##/$CUSTOMER/g"  dist/validate.html

    r.js -o buildPrint.js
    r.js -o cssIn=buildPrint.css out=dist/pcPrint.css

    cp --parents -fr pagination/images dist
    cp --parents pagination/styles/journals/paginate_article.css dist
    cp --parents pagination/styles/referenceStyles.css dist
    cp print.tmpl dist/print.html
    cp --parents pagination/scripts/ColumnBreaker.js dist
    cp --parents pagination/scripts/ContentHandler.js dist
    cp --parents pagination/scripts/FlowTemplate.js dist
    cp --parents pagination/scripts/LineBreaker.js dist
    cp --parents pagination/styles/journals/cpc/common-spec.css dist
    cp --parents pagination/styles/journals/cpc/double/5G-doublecol-layout.css dist
    cp --parents pagination/styles/journals/cpc/double/5G-doublecol-spec.css dist
    cp --parents pagination/styles/journals/cpc/single/3G-singlecol-layout.css dist
    cp --parents pagination/styles/journals/cpc/single/3G-singlecol-spec.css dist
    cp --parents pagination/styles/journals/others/double/5G-double-column.css dist
    cp --parents pagination/styles/journals/others/double/5G-paginateStyles.css dist
    cp --parents pagination/styles/journals/others/single/3G-single-column.css dist
    cp --parents pagination/styles/journals/others/single/proof-mode.css dist
    cp --parents pagination/styles/journals/others/single/typeSpec.css dist
    cp --parents pagination/styles/journals/heliyon/HLY-stubbed-column.css dist
    cp --parents pagination/styles/journals/heliyon/heliyon-paginateStyles.css dist
    cp --parents pagination/styles/proofOverlay.css dist
    cp --parents pagination/styles/errorDialog.css dist
    cp --parents pagination/styles/proof-common.css dist

    # Configuration Files
    cp pagination/config/proof.json.liquid dist/config/proof.json
    cp pagination/config/proof_routes.json.liquid dist/config/proof_routes.json

    cp xml-editor/config/config.json.liquid dist/config/config.json
    cp xml-editor/config/xmleditor_routes.json.liquid dist/config/xmleditor_routes.json
}

buildPhoenix()
{
    # sh phoenix/build.sh "output folder" "phoenix basepath"
    sh phoenix/build.sh "dist/phoenix" "phoenix"
}

buildLocale() {
    sh mergeLocale.sh "$OUTPUT/dist" "$BASEPATH" "$CUSTOMER"
}

buildTemplate() {
    sh buildTemplate.sh "$CUSTOMER" "$TAGID" "$OUTPUT/dist" "$BASEPATH/dist"
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

getTagId() {
    echo "${GREEN} Release Tag Id: ${NORMAL}"
    read input_variable
    if [ "$input_variable" = "" ]
    then
       echo "Error"
       exit
    fi
    TAGID=$input_variable
}

if [ -z "$OUTPUT" ]; then
    OUTPUT=$PWD
fi
if [ -z "$BASEPATH" ]; then
    BASEPATH=$PWD
fi

chooseCustomer
getTagId

echo "${YELLOW}1. Initializing${NORMAL}"
folderCreate

echo "${YELLOW}2. Building and Copying neccessary files/folders...${NORMAL}"
buildJs
buildCss
buildLocale
buildCommon
buildTemplate


echo "${YELLOW}3. Building PAGINATE...${NORMAL}"
buildPaginate
echo "${GREEN}Pagination Build Completed!!!${NORMAL}\n"

echo "${YELLOW}4. Building PHOENIX...${NORMAL}"
buildPhoenix

echo "${YELLOW}5. Building XML Editor...${NORMAL}"
copyXML

echo "${YELLOW}6. Building Manual Submit...${NORMAL}"
buildManualSubmit

echo "${YELLOW}7. Building Feature Toggler...${NORMAL}"
buildFeatureToggle

echo "\n${NORMAL}************************${NORMAL}"
echo "${GREEN}PCUI Build Completed!!!${NORMAL}"
echo "${NORMAL}************************${NORMAL}"


echo "\n${RED}*********Config files needs to change***************${NORMAL}"
echo "${GREEN}1. dist/config/routes.json${NORMAL}"
echo "${GREEN}2. dist/config/proof_routes.json${NORMAL}"
echo "${GREEN}3. dist/manualSubmit/scripts/config.js${NORMAL}"
echo "${GREEN}3. dist/featuretoggler/scripts/config.js${NORMAL}"
echo "${GREEN}4. dist/config/xmleditor.json${NORMAL}"
echo "${GREEN}5. dist/config/xmleditor_routes.json${NORMAL}"
echo "${RED}******************************************************${NORMAL}"
