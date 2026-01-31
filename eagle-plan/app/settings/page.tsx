"use client";

import { useState } from "react";
import { Header } from "@/components/eagle-plan/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Settings, Palette, Type, Bell, Shield, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState([16]);
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={cn("min-h-screen bg-background", darkMode && "dark")}>
      <Header />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Page Header */}
          <div className="mb-8">
            <Badge variant="outline" className="mb-2">
              Settings
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Preferences
            </h1>
            <p className="text-muted-foreground">
              Customize your Eagle Plan experience
            </p>
          </div>

          <div className="space-y-6">
            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how Eagle Plan looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Text Size</Label>
                      <p className="text-sm text-muted-foreground">
                        Adjust the base font size
                      </p>
                    </div>
                    <span className="text-sm font-medium text-foreground">{fontSize[0]}px</span>
                  </div>
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    min={12}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Small</span>
                    <span>Default</span>
                    <span>Large</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  Academic Preferences
                </CardTitle>
                <CardDescription>
                  Configure your degree planning settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Default Credits per Semester</Label>
                  <Select defaultValue="15">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 credits (Light)</SelectItem>
                      <SelectItem value="15">15 credits (Standard)</SelectItem>
                      <SelectItem value="18">18 credits (Full)</SelectItem>
                      <SelectItem value="21">21 credits (Overload)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Starting Semester</Label>
                  <Select defaultValue="fall-2025">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fall-2025">Fall 2025</SelectItem>
                      <SelectItem value="spring-2026">Spring 2026</SelectItem>
                      <SelectItem value="summer-2026">Summer 2026</SelectItem>
                      <SelectItem value="fall-2026">Fall 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Expected Graduation</Label>
                  <Select defaultValue="spring-2027">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fall-2026">Fall 2026</SelectItem>
                      <SelectItem value="spring-2027">Spring 2027</SelectItem>
                      <SelectItem value="fall-2027">Fall 2027</SelectItem>
                      <SelectItem value="spring-2028">Spring 2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifs" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about registration deadlines
                    </p>
                  </div>
                  <Switch
                    id="email-notifs"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="prereq-alerts" className="text-base">Prerequisite Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when prerequisites are met
                    </p>
                  </div>
                  <Switch id="prereq-alerts" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="schedule-reminders" className="text-base">Schedule Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Reminders before registration opens
                    </p>
                  </div>
                  <Switch id="schedule-reminders" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy
                </CardTitle>
                <CardDescription>
                  Control your data and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="share-progress" className="text-base">Share Progress with Advisor</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow advisors to view your degree plan
                    </p>
                  </div>
                  <Switch id="share-progress" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics" className="text-base">Usage Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve Eagle Plan with anonymous data
                    </p>
                  </div>
                  <Switch id="analytics" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} className="min-w-[150px]">
                {saved ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
