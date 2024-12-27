

// pages/Scan.js
import React, { useState, useRef } from "react";
import { QrReader } from "react-qr-reader";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { db } from "../../firebaseConfig"; 
import { doc, setDoc, getDoc } from "firebase/firestore";// Import Firebase config

export default function Scan() {
  const router = useRouter();
  const [data, setData] = useState("No result");
  const [showModal, setShowModal] = useState(false);
  const [isAlreadyScanned, setIsAlreadyScanned] = useState(false);
  const qrRef = useRef(null);

  const handleScan = (result, error) => {
    if (!!result) {
      setData(result.text);
      setShowModal(true);
      if (qrRef.current) {
        qrRef.current.stop();
      }
    }

    if (!!error) {
      console.error("Error during scanning: ", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.reload(); // Reload the page when closing the modal
  };

  const handleOK = async () => {
    try {
    
      const qrData = btoa(data); 
      const eventId = "B1toE0bN7s2NL9idLTpJ";

      const scannedDataRef = doc(db, 'monthlymeet', eventId, 'qrcodes', qrData); 
      const docSnapshot = await getDoc(scannedDataRef);
      
      if (docSnapshot.exists()) {
        alert("This QR code has already been scanned!");
      } else {
        await setDoc(scannedDataRef, {
          data: data, 
          scanned: true,
          scanTime: new Date().toISOString(),
        });
        alert("QR code scanned successfully!");
      }
    } catch (error) {
      console.error("Error saving scanned data: ", error);
      alert(`Error saving scanned data: ${error.message}`);
    } finally {
      handleCloseModal(); 
    }
  };
  
  

  return (
    <>
     <Head>
        <title>QR Scanner</title>
        <meta name="description" content="QR Code Scanner" />
      </Head>
      <main className="flex flex-col mt-[5rem] justify-center items-center">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-4xl font-bold mb-4">QR Scanner</h1>
          <div>
            <QrReader
              className="lg:h-[400px] lg:w-[400px] h-[300px] w-[300px]"
              onResult={handleScan}
              constraints={{ facingMode: "environment" }}
              style={{ width: "40%", height: "40%" }}
              ref={qrRef}
            />
          </div>
          <Link
            href={`/`}
            className="bg-yellow-200 m-4 text-md rounded-md px-4 py-2 hover:underline"
          >
            Back to home..
          </Link>
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white rounded-md p-4">
                <p className="text-xl font-bold mb-2">Scanned Data:</p>
                <p>{data}</p>
                {isAlreadyScanned && (
                  <p className="text-red-500">This QR code has already been scanned!</p>
                )}
                <button
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mt-4 hover:bg-gray-300"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                {!isAlreadyScanned && (
                  <button
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mx-4 mt-4 hover:bg-gray-300"
                    onClick={handleOK}
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}


       