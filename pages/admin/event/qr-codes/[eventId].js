import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../../../firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import QRCode from "react-qr-code";
import Layout from "../../../../component/Layout";

export default function QRCodesPage() {
  const router = useRouter();
  const { eventId } = router.query;
  const [qrCodes, setQRCodes] = useState([]);
  const [newQRDescription, setNewQRDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const qrCollection = collection(db, "monthlymeet", eventId, "qrcodes");
        const qrSnapshot = await getDocs(qrCollection);
        const qrList = qrSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            qrData: data.qrData || "Invalid QR Data",
          };
        });
        setQRCodes(qrList);
      } catch (error) {
        console.error("Error fetching QR codes:", error);
        setError("Error fetching QR codes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchQRCodes();
  }, [eventId]);

  // Add a new QR code
  const handleAddQRCode = async () => {
    if (!newQRDescription) return alert("Description is required!");
    try {
      const qrCollection = collection(db, "monthlymeet", eventId, "qrcodes");
      const newQRData = {
        description: newQRDescription,
        qrData: String(`${eventId}-${Date.now()}`), // Ensure valid string
      };
      const qrDoc = await addDoc(qrCollection, newQRData);
      setQRCodes([...qrCodes, { id: qrDoc.id, ...newQRData }]);
      setNewQRDescription("");
    } catch (error) {
      console.error("Error adding QR code:", error);
      setError("Error adding QR code. Please try again.");
    }
  };

  // Delete a QR code
  const handleDeleteQRCode = async (qrId) => {
    try {
      await deleteDoc(doc(db, "monthlymeet", eventId, "qrcodes", qrId));
      setQRCodes(qrCodes.filter((qr) => qr.id !== qrId));
    } catch (error) {
      console.error("Error deleting QR code:", error);
      setError("Error deleting QR code. Please try again.");
    }
  };

  return (
    <Layout>
    <section>
      <h2>Manage QR Codes</h2>
      <button onClick={() => router.back()}>Back</button>
      <div>
        <input
          type="text"
          value={newQRDescription}
          onChange={(e) => setNewQRDescription(e.target.value)}
          placeholder="Enter QR Code description"
        />
        <button onClick={handleAddQRCode}>Add QR Code</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {qrCodes.map((qr) => (
            <li key={qr.id}>
              <p>{qr.description}</p>
              {qr.qrData ? (
                <QRCode value={String(qr.qrData)} size={128} />
              ) : (
                <p style={{ color: "red" }}>Invalid QR data</p>
              )}
              <button onClick={() => handleDeleteQRCode(qr.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </section>
    </Layout>
  );
}
