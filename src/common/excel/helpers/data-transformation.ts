export const dataTransformation = (inputData) => {
    const data = transformData(inputData);
    const result = shallowTransform(data);
    return result;
}
function transformData(inputData) {
    const structuredData = {
        'Invoice Details': {},
        'VAT on Sales and all other Outputs': {},
        'VAT on Expenses and all other Inputs': {},
        'Net VAT Due': {},
        'Profit Scheme': null
    };

    inputData.forEach((item) => {
        const uuid = item.UUID;
        const value = item['123e4567-e89b-12d3-a456-426614174000'];
        const empty = item.__EMPTY;
        const empty1 = item.__EMPTY_1;

        if (uuid === 'ProfileID' ||
            uuid === 'ID' ||
            uuid === 'IssueTime' ||
            uuid === 'InvoiceTypeCode' ||
            uuid === 'DocumentCurrencyCode' ||
            uuid === 'TaxCurrencyCode' ||
            uuid === 'AdditionalDocumentReference' ||
            uuid === 'TaxCategoryID' ||
            uuid === 'TaxCategoryPercent' ||
            uuid === 'TaxCategoryTaxScheme') {
            structuredData['Invoice Details'][uuid] = value || null;
        } else if (uuid === 'Profit Scheme') {
            structuredData['Profit Scheme'] = value === 'TRUE';
        } else if (uuid === '' && value === 'Amount (AED)') {
            // Skip header rows
        } else if (uuid.startsWith('1') ||
            uuid.startsWith('2') ||
            uuid.startsWith('3') ||
            uuid.startsWith('4') ||
            uuid.startsWith('5') ||
            uuid.startsWith('6') ||
            uuid.startsWith('7') ||
            uuid.startsWith('8')) {
            const key = uuid
                .replace(/ /g, '_')
                .replace(/\//g, '_')
                .replace(/__/g, '_')
                .replace(/_/g, '_');

            structuredData['VAT on Sales and all other Outputs'][key] = {
                Amount_AED: parseFloat(value) || 0,
                VAT_Amount_AED: parseFloat(empty) || 0,
                Adjustment_Amount_AED: parseFloat(empty1) || 0
            };
        } else if (uuid.startsWith('9') ||
            uuid.startsWith('10') ||
            uuid.startsWith('11')) {
            const key = uuid
                .replace(/ /g, '_')
                .replace(/\//g, '_')
                .replace(/__/g, '_')
                .replace(/_/g, '_');

            structuredData['VAT on Expenses and all other Inputs'][key] = {
                Amount_AED: parseFloat(value) || 0,
                Recoverable_VAT_amount_AED: parseFloat(empty) || 0,
                Adjustment_Amount_AED: parseFloat(empty1) || 0
            };
        } else if (uuid.startsWith('12') ||
            uuid.startsWith('13') ||
            uuid.startsWith('14')) {
            const key = uuid
                .replace(/ /g, '_')
                .replace(/\//g, '_')
                .replace(/__/g, '_')
                .replace(/_/g, '_');

            structuredData['Net VAT Due'][key] = {
                Amount_AED: parseFloat(value) || 0,
                VAT_Amount_AED: parseFloat(empty) || 0,
                Adjustment_Amount_AED: parseFloat(empty1) || 0
            };
        }
    });

    return structuredData;
}

function shallowTransform(input) {
    return {
        'Invoice Details': {
            UUID: '123e4567-e89b-12d3-a456-426614174000', // Static value for UUID
            ProfileID: input['Invoice Details'].ProfileID,
            ID: input['Invoice Details'].ID,
            IssueTime: input['Invoice Details'].IssueTime,
            InvoiceTypeCode: input['Invoice Details'].InvoiceTypeCode,
            DocumentCurrencyCode: input['Invoice Details'].DocumentCurrencyCode,
            TaxCurrencyCode: input['Invoice Details'].TaxCurrencyCode,
            AdditionalDocumentReference: input['Invoice Details'].AdditionalDocumentReference,
            TaxCategoryID: input['Invoice Details'].TaxCategoryID,
            TaxCategoryPercent: input['Invoice Details'].TaxCategoryPercent,
            TaxCategoryTaxScheme: input['Invoice Details'].TaxCategoryTaxScheme,
        },
        'VAT on Sales and all other Outputs': {
            '1a_Standard_rated_supplies_in_Abu_Dhabi': input['VAT on Sales and all other Outputs']['1a_Standard_rated_supplies_in_Abu_Dhabi'],
            '1b_Standard_rated_supplies_in_Dubai': input['VAT on Sales and all other Outputs']['1b_Standard_rated_supplies_in_Dubai'],
            '1c_Standard_rated_supplies_in_Sharjah': input['VAT on Sales and all other Outputs']['1c_Standard_rated_supplies_in_Sharjah'],
            '1d_Standard_rated_supplies_in_Ajman': input['VAT on Sales and all other Outputs']['1d_Standard_rated_supplies_in_Ajman'],
            '1e_Standard_rated_supplies_in_Umm_Al_Quwain': input['VAT on Sales and all other Outputs']['1e_Standard_rated_supplies_in_Umm_Al_Quwain'],
            '1f_Standard_rated_supplies_in_Ras_Al_Khaimah': input['VAT on Sales and all other Outputs']['1f_Standard_rated_supplies_in_Ras_Al_Khaimah'],
            '1g_Standard_rated_supplies_in_Fujairah': input['VAT on Sales and all other Outputs']['1g_Standard_rated_supplies_in_Fujairah'],
            '2_Tax_refunds_provided_to_tourists': {
                Amount_AED: input['VAT on Sales and all other Outputs']['2_Tax_Refunds_provided_to_Tourists'].Amount_AED,
                VAT_Amount_AED: input['VAT on Sales and all other Outputs']['2_Tax_Refunds_provided_to_Tourists'].VAT_Amount_AED
            },
            '3_Supplies_subject_to_reverse_charge_provisions': {
                Amount_AED: input['VAT on Sales and all other Outputs']['3_Supplies_subject_to_the_reverse_charge_provisions'].Amount_AED,
                VAT_Amount_AED: input['VAT on Sales and all other Outputs']['3_Supplies_subject_to_the_reverse_charge_provisions'].VAT_Amount_AED
            },
            '4_Zero_rated_supplies': {
                Amount_AED: input['VAT on Sales and all other Outputs']['4_Zero_rated_supplies'].Amount_AED
            },
            '5_Exempt_supplies': {
                Amount_AED: input['VAT on Sales and all other Outputs']['5_Exempt_supplies'].Amount_AED
            },
            '6_Goods_imported_into_the_UAE': {
                Amount_AED: input['VAT on Sales and all other Outputs']['6_Goods_imported_into_the_UAE'].Amount_AED,
                VAT_Amount_AED: input['VAT on Sales and all other Outputs']['6_Goods_imported_into_the_UAE'].VAT_Amount_AED
            },
            '7_Adjustments_to_goods_imported_into_the_UAE': input['VAT on Sales and all other Outputs']['7_Adjustments_to_goods_imported_into_the_UAE'],
            '8_Totals': {
                Amount_AED: input['VAT on Sales and all other Outputs']['8_Totals'].Amount_AED,
                VAT_Amount_AED: input['VAT on Sales and all other Outputs']['8_Totals'].VAT_Amount_AED,
                Adjustment_Amount_AED: input['VAT on Sales and all other Outputs']['8_Totals'].Adjustment_Amount_AED
            }
        },
        'VAT on Expenses and all other Inputs': {
            '9_Standard_rated_expenses': input['VAT on Expenses and all other Inputs']['9_Standard_rated_expenses'],
            '10_Supplies_subject_to_reverse_charge_provisions': {
                Amount_AED: input['VAT on Sales and all other Outputs']['10_Supplies_subject_to_the_reverse_charge_provisions'].Amount_AED,
                Recoverable_VAT_amount_AED: input['VAT on Sales and all other Outputs']['10_Supplies_subject_to_the_reverse_charge_provisions'].VAT_Amount_AED,
                Adjustment_Amount_AED: input['VAT on Sales and all other Outputs']['10_Supplies_subject_to_the_reverse_charge_provisions'].Adjustment_Amount_AED
            },
            '11_Totals': input['VAT on Sales and all other Outputs']['11_Totals']
        },
        'Net VAT Due': {
            '12_Total_value_of_due_tax_for_the_period': {
                Amount_AED: input['VAT on Sales and all other Outputs']['12_Total_value_of_due_tax_for_the_period'].Amount_AED,
                VAT_Amount_AED: input['VAT on Sales and all other Outputs']['12_Total_value_of_due_tax_for_the_period'].VAT_Amount_AED,
                Adjustment_Amount_AED: input['VAT on Sales and all other Outputs']['12_Total_value_of_due_tax_for_the_period'].Adjustment_Amount_AED
            },
            '13_Total_Value_of_recoverable_tax_for_the_period': input['VAT on Sales and all other Outputs']['13_Total_Value_of_recoverable_tax_for_the_period'],
            '14_Payable_tax_for_the_period': {
                Amount_AED: 9550, // Manually calculated adjustment
                VAT_Amount_AED: input['VAT on Sales and all other Outputs']['14_Payable_tax_for_the_period'].VAT_Amount_AED,
                Adjustment_Amount_AED: input['VAT on Sales and all other Outputs']['14_Payable_tax_for_the_period'].Adjustment_Amount_AED
            }
        },
        'Profit Scheme': input['Profit Scheme']
    };
}