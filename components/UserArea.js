import { useState, useRef } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Navbar() {
  const [pinDigits, setPinDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [profileName, setProfileName] = useState("");
  const [pinPendingActivation, setPinPendingActivation] = useState(false);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...pinDigits];
    newDigits[index] = value;
    setPinDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyPin = async () => {
    setErrorMessage("");
    setPinPendingActivation(false);
    const pin = pinDigits.join("");

    const { data: codeData, error: codeError } = await supabase
      .from("code")
      .select("text, active, user_id")
      .eq("text", pin)
      .single();

    if (codeError || !codeData) {
      setErrorMessage("PIN inválido o desactivado.");
      return;
    }

    if (!codeData.active) {
      setPinPendingActivation(true);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", codeData.user_id)
      .single();

    if (profileError || !profile) {
      setErrorMessage("No se pudo obtener la información del usuario.");
      return;
    }

    setProfileName(profile.name);
    setVerified(true);
  };

  const whatsappUrl = `https://wa.me/573507498087?text=${encodeURIComponent(
    "Quiero participar en los Fetu Games 3"
  )}`;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8 relative">
      {/* Logo */}
      <div className="absolute top-4 right-4">
        <img
          src="https://images.encantia.lat/fs.png"
          alt="Logo"
          className="w-16 h-16 object-contain"
        />
      </div>

      {/* Pantalla de ingreso de PIN */}
      {!verified && !pinPendingActivation && (
        <div className="flex flex-col items-center justify-center h-full gap-6 mt-20">
          <h1 className="text-2xl font-semibold text-center">Ingrese su PIN de 6 dígitos</h1>
          <div className="flex gap-2">
            {pinDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-12 text-center text-xl bg-gray-800 text-white border border-gray-600 rounded"
              />
            ))}
          </div>
          <button
            onClick={handleVerifyPin}
            className="bg-white text-black px-6 py-2 rounded hover:bg-gray-300 transition"
          >
            Verificar PIN
          </button>
          {errorMessage && <p className="text-sm text-red-400 text-center max-w-xs">{errorMessage}</p>}
        </div>
      )}

      {/* PIN correcto pero desactivado */}
      {pinPendingActivation && (
        <div className="flex flex-col items-center justify-center h-full gap-6 mt-20 text-center">
          <p className="max-w-md text-white text-lg">
            Por favor, comuníquese a este número de WhatsApp para proceder con la activación del código y obtener acceso al contenido del sitio web.
          </p>
          <a
            href="https://wa.me/573507498087"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded"
          >
            Contactar por WhatsApp
          </a>
        </div>
      )}

      {/* Contenido autorizado */}
      {verified && (
        <div className="flex flex-col items-center justify-center mt-24 text-center">
          <div className="border border-white p-8 max-w-xl rounded shadow-lg bg-black">
            <h2 className="text-3xl font-bold mb-6">
              Felicidades por ganar, {profileName}
            </h2>
            <p className="mb-2">Para: {profileName}</p>
            <p className="mb-4">
              Querido {profileName},<br /><br />
              ¡Felicidades por tu victoria en los Fetus Games 2! Ganar entre casi 100 jugadores y destacar en los 12 desafiantes juegos no es tarea fácil.<br /><br />
              Ahora, queremos invitarte cordialmente a participar en los Fetus Games 3. ¿Estás listo para defender tu título y enfrentarte a nuevos retos?<br /><br />
              Esperamos tu respuesta con emoción.<br /><br />
              Con aprecio,<br />
              MrAlexXD_ y Fetu Team
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded cursor-pointer transition"
            >
              Sí, quiero participar
            </a>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-4 right-4 text-xs text-white opacity-70">
        Powered by Encantia
      </div>
    </div>
  );
}
