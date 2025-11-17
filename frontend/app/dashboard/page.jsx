// app/dashboard/page.jsx
'use client';
import React from "react";
import ProtectedClient from '@/components/ProtectedClient';
import UserMenu from '@/components/UserMenu';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function Dashboard() {
  return (
    <ProtectedClient>
      <div className="min-h-screen bg-gradient-to-br from-black to-blue-50 p-8">
        <div className="max-w-[1300px] mt-50 mx-auto bg-white/60 rounded-2xl p-6 grid grid-cols-12 gap-6 shadow-lg">
          {/* Sidebar */}
          <aside className="col-span-2 bg-white/50 rounded-xl p-4 flex flex-col gap-6">
            <div className="text-xl font-semibold">AmSpace</div>
            <nav className="flex-1">
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-3 px-3 py-2 rounded-md bg-black text-white">Dashboard</li>
                <li className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100">Schedule</li>
                <li className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100">Tasks</li>
                <li className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100">Tests</li>
                <li className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100">Reports</li>
                <li className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100">Chat</li>
                <li className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100">Notes</li>
              </ul>
            </nav>
            <div className="text-sm text-slate-600">Settings</div>
          </aside>

          <main className="col-span-7 flex flex-col gap-6">
            {/* NAV / header inside dashboard (you asked to keep nav here) */}
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <a href="/" className="text-lg font-semibold">AmSpace</a>
                <nav>
                  <ul className="flex gap-4 text-sm">
                    <li><a href="/dashboard" className="underline">Dashboard</a></li>
                    <li><a href="/events">Events</a></li>
                    <li><a href="/attendance">Attendance</a></li>
                    <li><a href="/notes">Notes</a></li>
                  </ul>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <Input placeholder="Search" className="max-w-md" />
                <UserMenu />
              </div>
            </header>

            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <CardHeader>
                  <CardTitle>GPA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">4.7</div>
                  <div className="text-xs text-slate-500 mt-2">Your performance has increased by 2% compared to last semester</div>
                </CardContent>
              </Card>

              <Card className="p-4">
                <CardHeader>
                  <CardTitle>On-time rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">96%</div>
                  <Badge variant="secondary" className="mt-2">High</Badge>
                  <div className="text-xs text-slate-500 mt-2">Your scores have increased by 12% compared to last semester</div>
                </CardContent>
              </Card>

              <Card className="p-4">
                <CardHeader>
                  <CardTitle>Class attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <div key={i} className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center text-green-800">✓</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-2">
              <CardHeader>
                <CardTitle>My tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All tasks</TabsTrigger>
                    <TabsTrigger value="todo">To do</TabsTrigger>
                    <TabsTrigger value="inprogress">In progress</TabsTrigger>
                    <TabsTrigger value="done">Done</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <ul className="space-y-4">
                      <li className="p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">Conduct a virtual experiment on chemical reactions and prepare a report</div>
                            <div className="text-xs text-slate-500">Chemistry • Jun 8</div>
                          </div>
                          <Badge>To do</Badge>
                        </div>
                      </li>

                      <li className="p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">Complete a term-matching task in biology</div>
                            <div className="text-xs text-slate-500">Biology • Jun 3</div>
                          </div>
                          <Badge variant="outline">In progress</Badge>
                        </div>
                      </li>

                      <li className="p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">Study the influence of cultural traditions on contemporary art</div>
                            <div className="text-xs text-slate-500">Art History • Jun 2</div>
                          </div>
                          <Badge variant="secondary">In progress</Badge>
                        </div>
                      </li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-center">
                  <Button>View all tasks</Button>
                </div>
              </CardFooter>
            </Card>
          </main>

          {/* Right column */}
          <aside className="col-span-3 flex flex-col gap-4">
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Attendance (month)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d)=> (
                    <div key={d} className="text-xs text-slate-500 text-center">{d}</div>
                  ))}
                  {Array.from({length:21}).map((_,i)=> (
                    <div key={i} className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">✓</div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader>
                <CardTitle>My schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Lesson</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>8:20</TableCell>
                      <TableCell>Biology</TableCell>
                      <TableCell>Terry Melton</TableCell>
                      <TableCell>B2, room 120</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>9:00</TableCell>
                      <TableCell>Chemistry</TableCell>
                      <TableCell>Olive Castillo</TableCell>
                      <TableCell>B2, room 124</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>10:00</TableCell>
                      <TableCell>Literature</TableCell>
                      <TableCell>Jeremy Curry</TableCell>
                      <TableCell>B5, room 223</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </ProtectedClient>
  );
}
