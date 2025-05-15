import { Button } from "@/components/ui/button";
import {
  Card,  
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Users, UserSquare2 } from 'lucide-react'; // Icons for tabs

// Dummy data for scenarios
const roleplayScenarios = [
  { id: 1, title: "Cold Sales Call", description: "Try your hand at booking a meeting from a cold sales call", category: "SALES", icon: <Globe className="w-5 h-5 mr-2 text-blue-500" /> },
  { id: 2, title: "Inbound Customer Discovery", description: "Turn an interested individual into a qualified lead as you understand their pain points", category: "SALES", icon: <Globe className="w-5 h-5 mr-2 text-blue-500" /> },
  { id: 3, title: "Outbound Customer Discovery", description: "Build rapport and gain understanding with a prospect", category: "SALES", icon: <Globe className="w-5 h-5 mr-2 text-blue-500" /> },
  { id: 4, title: "Manager Performance Review", description: "A negative performance review with your direct report.", category: "MANAGER TRAINING", icon: <Users className="w-5 h-5 mr-2 text-purple-500" /> },
  { id: 5, title: "Manager Skills Training", description: "A one-on-one with your direct report, who is having trouble running effective meetings.", category: "MANAGER TRAINING", icon: <Users className="w-5 h-5 mr-2 text-purple-500" /> },
  { id: 6, title: "Customer Support", description: "Help a customer with a technical issue", category: "OTHER", icon: <UserSquare2 className="w-5 h-5 mr-2 text-green-500" /> },
  { id: 7, title: "Custom", description: "A generic conversation, which you can mold as you see fit.", category: "OTHER", icon: <UserSquare2 className="w-5 h-5 mr-2 text-green-500" /> },
  { id: 8, title: "Media Training", description: "Get interviewed by a journalist.", category: "OTHER", icon: <UserSquare2 className="w-5 h-5 mr-2 text-green-500" /> },
];

const personas = [
  { id: 1, name: "Agnes Potts", role: "VP of Sales", tag: "ENTHUSIASTIC", imageUrl: "/placeholder-user.jpg" }, // Replace with actual image paths
  { id: 2, name: "Kevin Brown", role: "Software Engineer", tag: "BLUNT", imageUrl: "/placeholder-user.jpg" },
  { id: 3, name: "Linda Chen", role: "Product Manager", tag: "CURIOUS", imageUrl: "/placeholder-user.jpg" },
  { id: 4, name: "Priya Anand", role: "CEO", tag: "ASSERTIVE", imageUrl: "/placeholder-user.jpg" },
  { id: 5, name: "Mike McMillan", role: "Manager", tag: "FRIENDLY", imageUrl: "/placeholder-user.jpg" },
];

export default function PracticePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Builder</h1>
      <Tabs defaultValue="roleplay" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="roleplay">Roleplay Scenarios</TabsTrigger>
          <TabsTrigger value="interview">Interview Scenarios</TabsTrigger>
          <TabsTrigger value="personas">Personas</TabsTrigger>
        </TabsList>

        <TabsContent value="roleplay">
          <div className="flex justify-between items-center mb-4 mt-6">
            <div>
              <h2 className="text-xl font-semibold">Create a roleplay scenario</h2>
              <p className="text-sm text-muted-foreground">Build customized roleplay scenarios for your own personal use.</p>
            </div>
            {/* Filter and Search can be added later */}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roleplayScenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader>
                  <div className="flex items-center">
                    {scenario.icon}
                    <CardTitle>{scenario.title}</CardTitle>
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">Customize</Button>
                  <span className="text-xs text-muted-foreground">{scenario.category}</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interview">
          <div className="flex justify-between items-center mb-4 mt-6">
            <div>
              <h2 className="text-xl font-semibold">Create an interview scenario</h2>
              <p className="text-sm text-muted-foreground">Practice for your upcoming interviews.</p>
            </div>
            <Button>Create new</Button>
          </div>
          {/* Placeholder for interview scenarios list */}
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            Interview Scenarios Coming Soon
          </div>
        </TabsContent>

        <TabsContent value="personas">
          <div className="flex justify-between items-center mb-4 mt-6">
            <div>
              <h2 className="text-xl font-semibold">Create a persona</h2>
              <p className="text-sm text-muted-foreground">Build your preferred AI roleplay partner.</p>
            </div>
            <Button>Create new</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {personas.map((persona) => (
              <Card key={persona.id}>
                <CardHeader className="flex flex-row items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={persona.imageUrl} alt={persona.name} className="w-12 h-12 rounded-full" />
                  <div>
                    <CardTitle>{persona.name}</CardTitle>
                    <CardDescription>{persona.role}</CardDescription>
                  </div>
                  {/* Add more options icon here */}
                </CardHeader>
                <CardContent>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{persona.tag}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 