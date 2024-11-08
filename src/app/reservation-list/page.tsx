"use client"; // Important for hooks to work on client-side
import { useState, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input"; // Shadcn UI component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Shadcn Table
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";


import Image from "next/image";

// Typing for reservations
type Reservation = {
  id: number;
  person: {
    id: number;
    last_name: string;
    first_name: string;
    role: string;
  };
  table: {
    id: number;
    name: string;
    number: number;
  };
  seats_booked: number;
};

type TableType = {
  id: number;
  totalSeatsBooked: number;
  number: string;
  name: string;
  seats_number: number;
};

export default function ReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationCopy, setReservationCopy] = useState<Reservation[]>([]);
  const [visible, setVisible] = useState(false);
  const [modificationVisible, setModificationVisible] = useState(false);
  const [recapVisible, setRecapVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [availableTable, setAvailableTable] = useState<TableType[]>([]);
  const [availableTableFiltered, setAvailableTableFiltered] = useState<TableType[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking/load`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "authorization": "Bearer " + sessionStorage.getItem("token")
          },
        });
        const data = await res.json();
        setReservations(data);
        setReservationCopy(data);
      } catch (error) {
        console.error("Erreur lors du chargement des réservations :", error);
      }
    };

    const fetchTables = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/table/load`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "authorization": "Bearer " + sessionStorage.getItem("token")
          }
        });
        const data = await res.json();
        setAvailableTable(JSON.parse(data));
      } catch (error) {
        console.error("Erreur lors du chargement des tables :", error);
      }
    };

    fetchReservations();
    fetchTables();
  }, []);

  const Filter = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "family") {
      const filtered = reservations.filter((res) =>
        res.person.last_name.toUpperCase().includes(value.toUpperCase())
      );
      setReservationCopy(filtered.length === 0 ? reservations : filtered);
    } else if (name === "table") {
      const filtered = reservations.filter(
        (res) =>
          res.table.name.toUpperCase().includes(value.toUpperCase()) &&
          value !== ""
      );
      setReservationCopy(filtered.length === 0 ? reservations : filtered);
    } else if (value === "") {
      setReservationCopy(reservations);
    }
  };

  const sendFinalMail = async () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking/mail-recap`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "authorization": "Bearer " + sessionStorage.getItem("token")
      }
    })
    setRecapVisible(false)
  }

  const Delete = async () => {

    if (selectedReservation) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}booking/delete/${selectedReservation.person.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "authorization": "Bearer " + sessionStorage.getItem("token")
          },
        });
        setReservationCopy(reservationCopy.filter((booking) => booking.person.id !== selectedReservation.person.id));
        setVisible(false)
      } catch (err) {
        console.error('Error deleting table:', err);
      }
    }

  };

  const Update = async () => {

    if (selectedReservation && selectedTable) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking/update/${selectedReservation.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "authorization": "Bearer " + sessionStorage.getItem("token")
          },
          body: JSON.stringify({ table_id: selectedTable.id })
        });
        const reservation = selectedReservation;
        reservation.table = { id: selectedTable.id, name: selectedTable.name, number: parseInt(selectedTable.number) };
        setReservationCopy(reservationCopy.map((res) => {
          if (res.id == reservation.id) {
            return reservation
          }
          return res;
        }));
        setModificationVisible(false);
      } catch (err) {
        console.error('Error deleting table:', err);
      }
    }
  };

  const handleChange = (value: string) => {
    const table = JSON.parse(value)
    setSelectedTable(table);
  };

  const selectReservation = (res: Reservation) => {
    setSelectedReservation(res);
    setVisible(true);
  };

  const selectReservationModification = (res: Reservation) => {
    setAvailableTableFiltered(availableTable.filter((table) => table.seats_number - table.totalSeatsBooked >= res.seats_booked && table.id != res.table.id));
    setSelectedReservation(res);
    setModificationVisible(true);
  };

  return (
    <div className="min-h-screen bg-[#ebebeb] dark:bg-hsl(230,50%,5%) p-8">
      <header className="flex justify-between items-center mb-6">
        <div className='flex' onClick={() => { history.back() }}>
          <span className="material-symbols-outlined">chevron_left</span>
          <p>Retour</p>
        </div>
        <h1 className="text-3xl font-bold text-center text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">
          Gestion des Réservations
        </h1>
        <Image
          src="/gala.png"
          alt="logo"
          width={80}
          height={80}
          className="dark:brightness-[0.8] dark:grayscale"
        />
      </header>

      <Button variant="destructive" className="flex" onClick={() => setRecapVisible(true)}>Valider la réservation</Button>

      <form id="reservation-filters" className="flex gap-4 mb-6 mt-6">
        <Input
          type="text"
          name="family"
          placeholder="Chercher une Famille"
          onChange={Filter}
          className="border-gray-300 dark:border-gray-600"
        />
        <Input
          type="text"
          name="table"
          placeholder="Chercher une Table"
          onChange={Filter}
          className="border-gray-300 dark:border-gray-600"
        />
      </form>

      {/* Table Display */}
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <Table className="min-w-full">
          <TableHeader className="bg-[#ebebeb] dark:bg-hsl(230,50%,5%)">
            <TableRow>
              <TableHead className="text-center text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">Famille</TableHead>
              <TableHead className="text-center text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">Table</TableHead>
              <TableHead className="text-center text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">Places réservées</TableHead>
              <TableHead className="text-center text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservationCopy.map((res) => (
              <TableRow key={res.id} className={res.seats_booked < 10 ? "hover:bg-gray-100 dark:hover:bg-hsl(230,50%,10%)" : "bg-gray-300 hover:bg-gray-300"}>
                <TableCell className="text-hsl(230, 50%, 5%) dark:text-[#ebebeb] text-center ">{res.person.role == "ADMIN" ? "ADMIN" : res.person.first_name + " " + res.person.last_name}</TableCell>
                <TableCell className="text-hsl(230, 50%, 5%) dark:text-[#ebebeb] text-center">
                  {res.table.number} - {res.table.name}
                </TableCell>
                <TableCell className="text-hsl(230, 50%, 5%) dark:text-[#ebebeb] text-center">{res.seats_booked}</TableCell>
                <TableCell className="justify-center text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <span className="material-symbols-outlined text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">more_horiz</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem onClick={() => selectReservation(res)}>
                        <span>Supprimer</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => selectReservationModification(res)}>
                        <span>Modifier</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modificationVisible} onOpenChange={setModificationVisible}>
        <DialogContent className="bg-[#ebebeb]">
          <DialogHeader>
            <DialogTitle>Modifier la réservation</DialogTitle>
          </DialogHeader>
          <div>
            <Select onValueChange={handleChange}>
              <SelectTrigger className="w-[380px]" >
                <SelectValue placeholder="Selectionnez une table">
                  {selectedTable?.number + " - " + selectedTable?.name || selectReservation.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Table</SelectLabel>
                  {
                    availableTableFiltered.map(table => (
                      <SelectItem key={table.id} value={JSON.stringify(table)}>{table.number + " - " + table.name}</SelectItem>
                    ))
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={Update}>Enregistrer</Button>
            <Button variant="outline" onClick={() => setModificationVisible(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={visible} onOpenChange={setVisible}>
        <DialogContent className="bg-[#ebebeb]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>
            Voulez-vous vraiment supprimer cette réservation ?
          </p>
          <DialogFooter>
            <Button onClick={Delete}>Confirmer</Button>
            <Button variant="outline" onClick={() => setVisible(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={recapVisible} onOpenChange={setRecapVisible}>
        <DialogContent className="bg-[#ebebeb]">
          <DialogHeader>
            <DialogTitle>Valider les placements ?</DialogTitle>
          </DialogHeader>
          <p>
            Attention, cela va envoyer un mail à tous ceux ayant réservé !
          </p>
          <DialogFooter>
            <Button onClick={sendFinalMail}>Confirmer</Button>
            <Button variant="outline" onClick={() => setRecapVisible(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
