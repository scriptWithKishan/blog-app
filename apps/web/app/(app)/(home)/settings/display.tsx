import { ThemeSwitcher } from "@/components/theme-switcher";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";

export default function DisplaySettings() {
  return (
    <Card className="mt-10 p-2 w-full max-w-xl bg-card">
      <CardHeader className="font-heading text-2xl font-bold">Display</CardHeader>
      <CardContent>
      <Field orientation="horizontal">
          <FieldLabel className="w-24 shrink-0">Themes: </FieldLabel>
          <ThemeSwitcher />
        </Field>
      </CardContent>
    </Card>
  )
}