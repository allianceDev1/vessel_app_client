import axios from "axios";
import env from "../../config/env";


const downloadServiceBill = async (serviceSrlNumber) => {

    const firstTwoText = serviceSrlNumber?.slice(0, 2)
    const refType = firstTwoText === 'VF' ? 'VESSEL_FILTER' : "SERVICE_JOB"

    const response = await axios.get(`${env.API.FINANCE}/p/download/pdf/bill/rf/${refType}/${serviceSrlNumber}/group`, {
        responseType: "blob"
    });

    const blob = new Blob([response.data], {
        type: "application/pdf"
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `bill-${serviceSrlNumber}.pdf`;
    link.click();

    window.URL.revokeObjectURL(url);
}

const downloadServiceReceipt = async (billNo) => {

    const response = await axios.get(`${env.API.FINANCE}/p/download/pdf/receipt/bn/${billNo}`, {
        responseType: "blob"
    });

    const blob = new Blob([response.data], {
        type: "application/pdf"
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${billNo}.pdf`;
    link.click();

    window.URL.revokeObjectURL(url);
}

const downloadReceipt = async (receiptNo) => {

    const response = await axios.get(`${env.API.FINANCE}/p/download/pdf/receipt/rn/${receiptNo}`, {
        responseType: "blob"
    });

    const blob = new Blob([response.data], {
        type: "application/pdf"
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${receiptNo}.pdf`;
    link.click();

    window.URL.revokeObjectURL(url);
}


export {
    downloadServiceBill, downloadServiceReceipt, downloadReceipt
}