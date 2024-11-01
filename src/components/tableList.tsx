"use client"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type UserType = {
    id: number;
    mail: string;
    last_name: string;
    first_name: string;
    seats_remaining: number;
    role: string;
};

type TableData = {
    id: number;
    totalSeatsBooked: string;
    number: number;
    name: string;
    seats_number: number;
};

type TableListProps = {
    user: UserType;
    updateUser: Function;
};

function TableList({ user, updateUser }: TableListProps) {
    const [userProps, setUserProps] = useState(user);
    const [tables, setTables] = useState<TableData[]>([]);
    const [filteredTables, setFilteredTables] = useState<TableData[]>([]);
    const [visible, setVisible] = useState(false); // For dialog visibility
    const [selectedTable, setSelectedTable] = useState<TableData | null>(null);

    console.log(user);
    

    useEffect(() => {
        // Fetch tables when component mounts
        const fetchTables = async () => {
            try {
                await fetch("http://localhost:3001/table/load", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                    .then((res) => res.json())
                    .then((data) => {
                        data = JSON.parse(data);
                        if (data.length > 0) {
                            console.log(data.length);
                            data = data.filter(
                                (table: TableData) =>
                                    table.seats_number - parseInt(table.totalSeatsBooked) >= userProps.seats_remaining
                            );
                            console.log(data);
                            setTables(data);
                            setFilteredTables(data);
                        }
                        else {
                            console.log("0");
                        }
                    })

            } catch (error) {
                console.error("Erreur lors du chargement des tables :", error);
            }
        };

        fetchTables();
    }, [user]);

    const handleFilter = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value.length >= 2) {
            const filtered = tables.filter(
                (table) =>
                    table.name.includes(value) || table.number.toString() === value
            );
            setFilteredTables(filtered.length === 0 ? tables : filtered);
        } else if (value.length === 0) {
            setFilteredTables(tables);
        }
    };


    const sendMail = async (table: TableData, user: UserType) => {
        const mail = {
            name: user.first_name + " " + user.last_name,
            mail: user.mail,
            text: `Vous avez réservé ${user.seats_remaining} place à la table numéro ${table.number} : ${table.name}`
        }

        try {
            await fetch("http://localhost:3001/booking/mail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(mail)
            })
        } catch (error) {
            console.error("Problème lors de l'envoi du mail");
        }
    }

    const handleBook = async () => {
        if(userProps.seats_remaining > 0){
            if (selectedTable === null) return;

            const body = {
                table_id: selectedTable.id,
                person_id: userProps.id,
            };
    
            try {
                const res = await fetch("http://localhost:3001/booking/new", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                });
                if (res.ok) {

                    sendMail(selectedTable, userProps);

                    const updatedUser = { 
                        ...userProps, 
                        seats_remaining: 0 
                    };
    
                    // Mettre à jour l'utilisateur dans l'enfant
                    setUserProps(updatedUser);
    
                    // Mettre à jour l'utilisateur dans le parent via updateUser
                    updateUser(updatedUser);
                    
                    sessionStorage.setItem("user", JSON.stringify(updatedUser));
                    setVisible(false)
                }
            } catch (error) {
                console.error("Erreur lors de la réservation :", error);
            }
        }
    };

    const selectTable = (table: TableData) => {
        setSelectedTable(table);
        setVisible(true);
    };

    const TableScrollArea = () => (
        <ScrollArea className="h-72 w-96 rounded-md border">
            <div className="p-4">
                <h2 className="mb-4 text-sm font-semibold leading-none">Sélectionnez votre table</h2>
                {filteredTables.length > 0 ?

                    filteredTables.map((table) => (
                        <>
                            <div key={table.id} className="py-2 flex text-sm justify-between hover:bg-secondary" onClick={() => selectTable(table)}>
                                <div className="ml-1">
                                    <span className="text-center">{table.number}</span>
                                    <span>{" - " + table.name}</span>
                                </div>
                                <div className="mr-1">
                                    {(table.seats_number - parseInt(table.totalSeatsBooked))}
                                </div>
                            </div>

                            <Separator className="bg-home-img" />
                        </>

                    ))
                    :
                    <p>Aucune table disponible</p>
                }
            </div>
        </ScrollArea>
    );

    return (

        <div>
            <p className="mb-4 text-lg">
                Nombre de place à réserver : {userProps.seats_remaining}
            </p>
            <form className="space-y-4">
                <div className="flex space-x-4">
                    <Input
                        type="text"
                        placeholder="Chercher une Table"
                        onChange={handleFilter}
                    />
                </div>

                <TableScrollArea />
            </form>

            <Dialog open={visible} onOpenChange={setVisible}>
                <DialogContent className="bg-[#ebebeb]">
                    <DialogHeader>
                        <DialogTitle>Confirmer la réservation</DialogTitle>
                    </DialogHeader>
                    <p>
                        Voulez-vous vraiment réserver la table numéro{" "}
                        {selectedTable?.number} ?
                    </p>
                    <DialogFooter>
                        <Button onClick={handleBook}>Confirmer</Button>
                        <Button variant="outline" onClick={() => setVisible(false)}>
                            Annuler
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default TableList