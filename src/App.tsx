import { Box, Modal, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiSaveResult } from "./api/appApi";
import "./App.css";

interface ILetter {
  id: number;
  name: string;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "none",
  borderRadius: 5,
  boxShadow: 24,
  p: 4,
};

function App() {
  const [letters, setLetters] = useState<ILetter[]>([]);
  const [count, setCount] = useState(1);
  const seconds = useRef(0);
  const [timer, setTimer] = useState("0");
  const [modalOpen, setModalOpen] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    const fetchLetters = async () => {
      const json = await fetch(
        "https://6437c0c0894c9029e8c507a7.mockapi.io/letters"
      );
      const res = await json.json();
      let shuffled = shuffle(res);
      setLetters(shuffled);
    };
    fetchLetters();
  }, []);

  function shuffle(array: ILetter[]) {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  const setRandomLettersInRange = useCallback(() => {
    if (!letters) return;
    let shuffled = shuffle([...letters]);
    setLetters(shuffled);
  }, [letters]);

  const startGame = useCallback(() => {
    intervalRef.current = setInterval(startTimer, 1000);

    function startTimer() {
      seconds.current += 1;
      if (seconds.current > 59) {
        let mins = Math.floor(seconds.current / 60);
        let restSeconds = seconds.current - mins * 60;
        setTimer(`${mins}:${restSeconds}`);
      } else {
        setTimer(`${seconds.current}`);
      }
    }
  }, []);

  const onLetterClick = (id: number, index: number) => {
    if (count === 33) {
      setModalOpen(true);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      apiSaveResult(seconds.current);
    }
    if (!letters) return;
    if (seconds.current === 0) startGame();
    if (id === count) {
      setCount((val) => val + 1);
      let temp = letters;
      if (letters.length > 16) {
        temp[index] = letters[letters.length - 1];
        temp.pop();
        setLetters(temp);
      } else {
        temp[index] = { ...temp[index], name: "" };
      }
    }
  };

  return (
    <div className="App">
      <h1>От А до Я</h1>
      <Typography>
        Нажимайте на буквы настолько быстро, насколько вы сможете!
      </Typography>
      <Typography>Таймер будет запущен автоматически.</Typography>
      <button className="btn" onClick={() => setRandomLettersInRange()}>
        Обновить
      </button>
      <p>Таймер: {timer}</p>

      <div className="letters">
        {letters?.slice(0, 16).map((el, i) => {
          return (
            <button
              onClick={(e) => onLetterClick(+el.id, i)}
              key={i}
              className="btn btn-letter"
            >
              {el?.name}
            </button>
          );
        })}
      </div>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Поздравляю! Вы выиграли! У вас заняло на это {timer}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}

export default App;
