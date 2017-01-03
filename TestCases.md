Test Cases
============

Bold Plugin
- BoldMenuItem
- BoldCommand

Bold Command
- Should throw exception when DOMFragment or RequestID is missing
- Should wrap "optbold" and "data-name" in the given DOMFragment succesfully
- Should not wrap "optbold" on existing "optbold" tag
- Should merge "optbold" class in whitelisted tags in the given DOMFragment
- Should not merge "optbold" class in other than whitelisted tags in the given DOMFragment
- Should remove "optbold" element from the DOMFragment when context is "onBold"
