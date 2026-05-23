import axios from "axios";
import env from "../../config/env";


const downloadServiceBill = async (serviceSrlNumber) => {

    const response = await axios.get(`${env.API.FINANCE}/p/download/pdf/bill/rf/VESSEL_SERVICE/${serviceSrlNumber}/group`, {
        responseType: "blob"
    });

    console.log(response);
    console.log(response.headers["content-type"]);
    console.log(response.size);

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

    console.log(response);
    console.log(response.headers["content-type"]);
    console.log(response.size);

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


export {
    downloadServiceBill, downloadServiceReceipt
}