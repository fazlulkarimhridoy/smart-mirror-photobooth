import { useEffect, useRef, useState } from "react";
import Time5 from "../assets/New folder/5.png";
import Time4 from "../assets/New folder/4.png";
import Time3 from "../assets/New folder/3.png";
import Time2 from "../assets/New folder/2.png";
import Time1 from "../assets/New folder/1.png";
import Bg from "../assets/New folder/Asset 7@2x.png";
import axios from "axios";
import { RingLoader } from "react-spinners";
import QRCode from "react-qr-code";

const CountDown = () => {
    const videoRef = useRef(null);
    const [timeLeft, setTimeLeft] = useState(4);
    const [photoCaptured, setPhotoCaptured] = useState(false);
    const [hideTimerNumber, setHideTimerNumber] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [qrValue, setQrValue] = useState("Hellow world");
    // const [bgImageUrl, setBgImageUrl] = useState(Bg);

    // Countdown logic
    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);

            switch (true) {
                case timeLeft <= 0:
                    clearInterval(countdownInterval);
                    capturePhoto(); // Auto-capture when countdown ends
                    break;
                case timeLeft === 4:
                    document.getElementById("countdown1").src = Time4;
                    break;
                case timeLeft === 3:
                    document.getElementById("countdown1").src = Time3;
                    break;
                case timeLeft === 2:
                    document.getElementById("countdown1").src = Time2;
                    break;
                case timeLeft === 1:
                    document.getElementById("countdown1").src = Time1;
                    break;
            }
        }, 1000);

        // cleanup
        return () => {
            clearInterval(countdownInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    // use effect for playing video
    useEffect(() => {
        let videoElement = videoRef.current;
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
                videoElement.srcObject = stream;
                // eslint-disable-next-line no-unused-vars
                videoElement.onloadedmetadata = function (e) {
                    // Start playing the video
                    videoElement.play();
                };
            })
            .catch((err) => console.error(err));

        // Cleanup
        return () => {
            if (videoElement && videoElement.srcObject) {
                const tracks = videoElement.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
            }
        };
    }, []);

    // handle photo capture
    const capturePhoto = () => {
        if (!photoCaptured) {
            setShowLoader(true);
            // create canvas for photo capture
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
            const imgData = canvas.toDataURL("image/png");
            const file = dataURLtoFile(imgData, "storage.jpg");
            uploadImageToBannerAPI(file);
            setPhotoCaptured(true);
        }
    };

    // uploading image to api for banner
    const uploadImageToBannerAPI = async (file) => {
        console.log("🚀 ~ uploadImageToBannerAPI ~ file:", file);
        const formData = new FormData();
        formData.append("image", file);

        await axios
            .post("http://127.0.0.1:5000/process_image", formData)
            .then((res) => {
                console.log(res);
                let imageDataUrl = "data:image/png;base64," + res.data.image;
                console.log("Image processing successful:", imageDataUrl);
                var fileFromBanner = dataURLtoFile(imageDataUrl, "storage.jpg");
                uploadImageToStorageAPI(fileFromBanner);
            })
            .catch((err) => {
                console.log("Error image processing fail:", err);
            });
    };

    // uploading image to storage api
    const uploadImageToStorageAPI = async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        await axios
            .post("https://api-photobooth.xri.com.bd/upload", formData)
            .then((res) => {
                console.log(res);
                setHideTimerNumber(true);
                fileToDateURL(file, (dataURL) => {
                    const previewImage = document.getElementById("bgImage");
                    previewImage.src = dataURL;
                    console.log("Data URL:", dataURL);
                    // Disable the loader after setting the previewImage.src
                    setShowLoader(false);
                    setShowQRCode(true);
                    // setQrValue(dataURL);
                    // setBgImageUrl(dataURL);
                });
            })
            .catch((err) => {
                console.log("Error uploading image:", err);
            });
    };

    // function for convert dataURL to file
    const dataURLtoFile = (dataurl, filename) => {
        var arr = dataurl.split(","),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    // function for convert file to dataURL
    const fileToDateURL = (file, callback) => {
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            if (typeof callback === "function") {
                callback(event.target.result);
            }
        };

        reader.readAsDataURL(file);
    };

    // style to change bacground image
    // const bgStyle = {
    //     backgroundImage: `url(${Bg})`,
    //     backgroundSize: "cover",
    //     backgroundPosition: "center",
    //     backgroundRepeat: "no-repeat",
    //     height: "100vh",
    //     width: "100vw",
    // };

    return (
        <section
            // style={bgStyle}
            className="relative justify-center h-full w-full gap-4"
        >
            <div className="w-full relative">
                <img id="bgImage" className="w-full h-screen" src={Bg} />
                <video
                    ref={videoRef}
                    autoPlay
                    className="absolute hidden w-full h-screen"
                ></video>
            </div>

            <div
                className={`${
                    hideTimerNumber && "hidden"
                } absolute top-44 left-44 flex justify-center flex-col items-center gap-10 w-[15%]`}
            >
                <span className="countdown font-mono text-9xl text-[#E5A430]">
                    {/* show loader or timer */}
                    {!showLoader ? (
                        <img
                            id="countdown1"
                            className="w-96"
                            src={Time5}
                            alt=""
                        />
                    ) : (
                        <RingLoader
                            color={"#F2E3AA"}
                            loading={showLoader}
                            size={75}
                            aria-label="Loading Spinner"
                        />
                    )}
                </span>
            </div>

            {/* show qr after getting the preview image of removed bg */}
            {showQRCode && (
                <div
                    className="absolute top-40 left-40"
                    style={{
                        height: "auto",
                        margin: "0 auto",
                        maxWidth: 100,
                        width: "100%",
                    }}
                >
                    <QRCode
                        fgColor={"#000000"}
                        bgColor={"#645411"}
                        size={256}
                        style={{
                            height: "auto",
                            maxWidth: "100%",
                            width: "100%",
                        }}
                        value={qrValue}
                        viewBox={`0 0 256 256`}
                    />
                </div>
            )}
        </section>
    );
};

export default CountDown;
